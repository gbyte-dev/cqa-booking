const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Venue = require('../models/Venue');
const Customer = require('../models/Customer');
const { isWithinOperatingHours } = require('../utils/booking-rules');
const { writeAudit } = require('../utils/audit');
const { queueNotification } = require('../utils/notifications');

const router = express.Router();

// ===== CHECK AVAILABILITY =====
router.post('/availability', authMiddleware, async (req, res) => {
  try {
    const { venueId, bookingDate, bookingStartTime, bookingEndTime, numGuests } = req.body;

    if (!venueId || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const venue = await Venue.findOne({
      where: { id: venueId, organizationId: req.user.organizationId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    if (venue.status !== 'active' || !isWithinOperatingHours(
      bookingStartTime,
      bookingEndTime,
      venue.openingTime,
      venue.closingTime
    )) {
      return res.status(400).json({
        success: false,
        error: 'Venue is closed or booking is outside operating hours'
      });
    }

    // Get tables that can fit guests
    const tables = await Table.findAll({
      where: {
        venueId,
        capacity: { [Op.gte]: numGuests },
        status: 'active'
      }
    });

    if (tables.length === 0) {
      return res.json({
        success: true,
        available: [],
        message: 'No tables available for this guest count'
      });
    }

    // Check for conflicts
    const availableTables = [];

    for (const table of tables) {
      const conflict = await Booking.findOne({
        where: {
          tableId: table.id,
          bookingDate: new Date(bookingDate),
          bookingStatus: { [Op.ne]: 'cancelled' },
          bookingStartTime: { [Op.lt]: bookingEndTime },
          bookingEndTime: { [Op.gt]: bookingStartTime }
        }
      });

      if (!conflict) {
        availableTables.push({
          id: table.id,
          name: table.name,
          capacity: table.capacity
        });
      }
    }

    res.json({
      success: true,
      available: availableTables
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CREATE BOOKING (TENANT) =====
router.post('/', authMiddleware, async (req, res) => {
  let transaction;
  try {
    const {
      venueId,
      tableId,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      notes,
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      numGuests
    } = req.body;

    if (!venueId || !customerName || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const venue = await Venue.findOne({
      where: { id: venueId, organizationId: req.user.organizationId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    if (venue.status !== 'active' || !isWithinOperatingHours(
      bookingStartTime,
      bookingEndTime,
      venue.openingTime,
      venue.closingTime
    )) {
      return res.status(400).json({
        success: false,
        error: 'Venue is closed or booking is outside operating hours'
      });
    }

    transaction = await sequelize.transaction();

    let customer = null;
    if (customerEmail || customerPhone) {
      customer = await Customer.findOne({
        where: {
          organizationId: req.user.organizationId,
          ...(customerEmail ? { email: customerEmail } : { phone: customerPhone })
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
    }
    if (!customer) {
      const [firstName, ...lastNameParts] = customerName.trim().split(/\s+/);
      customer = await Customer.create({
        id: uuidv4(),
        organizationId: req.user.organizationId,
        firstName,
        lastName: lastNameParts.join(' ') || null,
        email: customerEmail || null,
        phone: customerPhone || null
      }, { transaction });
    }

    if (tableId) {
      const table = await Table.findOne({
        where: { id: tableId, venueId },
        include: [{
          model: Venue,
          as: 'Venue',
          where: { organizationId: req.user.organizationId },
          attributes: ['id']
        }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!table) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }
    }

    // Check for conflicts
    if (tableId) {
      const conflict = await Booking.findOne({
        where: {
          tableId,
          bookingDate: new Date(bookingDate),
          bookingStatus: { [Op.ne]: 'cancelled' },
          bookingStartTime: { [Op.lt]: bookingEndTime },
          bookingEndTime: { [Op.gt]: bookingStartTime }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (conflict) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Table already booked for this date'
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      id: uuidv4(),
      organizationId: req.user.organizationId,
      venueId,
      tableId: tableId || null,
      customerId: customer.id,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: new Date(bookingDate),
      bookingStartTime,
      bookingEndTime,
      numGuests,
      totalAmount: Number(totalAmount || 0),
      depositRequired: Number(venue.depositPercent || 0) > 0 ? Number(totalAmount || 0) * Number(venue.depositPercent) / 100 : 0,
      notes: notes || null,
      bookingStatus: 'pending'
    }, { transaction });

    await transaction.commit();
    await customer.increment('totalBookings');
    await writeAudit({ req, action: 'booking.created', entityType: 'booking', entityId: booking.id });
    if (customerEmail || customerPhone) {
      await queueNotification({ organizationId: req.user.organizationId, bookingId: booking.id, customerId: customer.id, channel: customerEmail ? 'email' : 'sms', event: 'booking_created', recipient: customerEmail || customerPhone, payload: { bookingId: booking.id, bookingDate, bookingStartTime, bookingEndTime } });
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET BOOKING STATS (MUST BE FIRST!) =====
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 [TENANT /bookings/stats] Calculating stats');

    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    // Tenant सिर्फ अपने organization के bookings देख सकता है
    const bookings = await Booking.findAll({
      where: { organizationId }
    });

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const checkedInBookings = bookings.filter(b => b.bookingStatus === 'checked_in').length;
    const noShowBookings = bookings.filter(b => b.bookingStatus === 'no_show' || b.noShow).length;
    const totalGuests = bookings.reduce((sum, booking) => sum + Number(booking.numGuests || 0), 0);

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        checkedInBookings,
        noShowBookings,
        totalGuests,
        averageBookingValue: 0
      }
    });
  } catch (error) {
    console.error('Tenant booking stats error:', error);
    res.status(200).json({
      success: true,
      data: {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        checkedInBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0
      }
    });
  }
});

// ===== GET ALL BOOKINGS (TENANT - ONLY THEIR ORG) =====
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📋 [TENANT /bookings] Fetching bookings');

    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    // Tenant सिर्फ अपने organization के bookings देख सकता है
    const bookings = await Booking.findAll({
      where: { organizationId },
      include: [
        {
          model: Venue,
          as: 'Venue',
          attributes: ['id', 'name', 'city', 'address'],
          required: false
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'name', 'capacity'],
          required: false
        }
      ],
      order: [['bookingDate', 'DESC']],
      limit: 500
    });

    console.log(`✅ Found ${bookings.length} bookings for org: ${organizationId}`);

    res.json({
      success: true,
      data: bookings || [],
      count: bookings.length
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  }
});

// ===== GET SINGLE BOOKING (TENANT - CHECK ORG) =====
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId  // ✅ Check organization
      },
      include: [
        {
          model: Venue,
          as: 'Venue',
          attributes: ['id', 'name', 'city', 'address'],
          required: false
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'name', 'capacity'],
          required: false
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CONFIRM BOOKING (TENANT) =====
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (Number(booking.depositRequired || 0) > Number(booking.depositPaid || 0)) {
      return res.status(400).json({ success: false, error: 'Required deposit must be paid before confirmation' });
    }

    await booking.update({ bookingStatus: 'confirmed' });
    await writeAudit({ req, action: 'booking.confirmed', entityType: 'booking', entityId: booking.id });

    res.json({
      success: true,
      message: 'Booking confirmed',
      data: booking
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== COMPLETE BOOKING (TENANT) =====
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await booking.update({
      bookingStatus: 'completed',
      checkOutTime: new Date()
    });
    if (booking.customerId) {
      await Customer.increment({ loyaltyPoints: 10 }, { where: { id: booking.customerId, organizationId: req.user.organizationId } });
    }

    res.json({
      success: true,
      message: 'Booking completed',
      data: booking
    });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CHECK IN BOOKING (TENANT) =====
router.post('/:id/check-in', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (!['confirmed', 'pending'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, error: 'Booking cannot be checked in' });
    }

    await booking.update({ bookingStatus: 'checked_in', checkInTime: new Date() });
    await writeAudit({ req, action: 'booking.checked_in', entityType: 'booking', entityId: booking.id });
    res.json({ success: true, message: 'Booking checked in', data: booking });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== MARK NO-SHOW (TENANT) =====
router.post('/:id/no-show', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (!['pending', 'confirmed'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, error: 'Booking cannot be marked as no-show' });
    }

    await booking.update({ bookingStatus: 'no_show', noShow: true });
    await writeAudit({ req, action: 'booking.no_show', entityType: 'booking', entityId: booking.id });
    res.json({ success: true, message: 'Booking marked as no-show', data: booking });
  } catch (error) {
    console.error('No-show error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CANCEL BOOKING (TENANT) =====
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const venue = await Venue.findOne({
      where: { id: booking.venueId, organizationId: req.user.organizationId }
    });
    const withinRefundWindow = new Date(booking.bookingDate).getTime() - Date.now() >= Number(venue?.cancellationWindowHours || 24) * 60 * 60 * 1000;

    await booking.update({
      bookingStatus: 'cancelled',
      cancellationReason: reason || null,
      cancellationDate: new Date(),
      cancellationBy: req.user.role,
      cancellationRefundAmount: withinRefundWindow
        ? Number(booking.depositPaid || 0) * Number(venue?.cancellationRefundPercent ?? 100) / 100
        : 0
    });

    await writeAudit({ req, action: 'booking.cancelled', entityType: 'booking', entityId: booking.id, metadata: { reason } });
    if (booking.customerEmail || booking.customerPhone) {
      await queueNotification({ organizationId: req.user.organizationId, bookingId: booking.id, customerId: booking.customerId, channel: booking.customerEmail ? 'email' : 'sms', event: 'booking_cancelled', recipient: booking.customerEmail || booking.customerPhone, payload: { refundAmount: booking.cancellationRefundAmount } });
    }

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: booking
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;