const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Venue = require('../models/Venue');

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
          bookingStatus: { [Op.ne]: 'cancelled' }
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
  try {
    const {
      venueId,
      tableId,
      customerName,
      customerEmail,
      customerPhone,
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

    // Check for conflicts
    if (tableId) {
      const conflict = await Booking.findOne({
        where: {
          tableId,
          bookingDate: new Date(bookingDate),
          bookingStatus: { [Op.ne]: 'cancelled' }
        }
      });

      if (conflict) {
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
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: new Date(bookingDate),
      bookingStartTime,
      bookingEndTime,
      numGuests,
      bookingStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
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

    await booking.update({ bookingStatus: 'confirmed' });

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

    await booking.update({
      bookingStatus: 'cancelled',
      cancellationReason: reason || null,
      cancellationDate: new Date()
    });

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