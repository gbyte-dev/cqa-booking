const express = require('express');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

const router = express.Router();

// ===== GET BOOKING STATS (MUST BE FIRST!) =====
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 [SUPERADMIN /bookings/stats] Calculating stats');

    // Superadmin देख सकता है सब bookings
    const bookings = await Booking.findAll();

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
    console.error('Superadmin booking stats error:', error);
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

// ===== GET ALL BOOKINGS (SUPERADMIN) =====
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📋 [SUPERADMIN /bookings] Fetching all bookings');

    // Superadmin सभी bookings देख सकता है
    const bookings = await Booking.findAll({
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

    console.log(`✅ Found ${bookings.length} total bookings`);

    res.json({
      success: true,
      data: bookings || [],
      count: bookings.length
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  }
});

// ===== GET SINGLE BOOKING (SUPERADMIN) =====
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Venue,
          as: 'Venue',
          required: false
        },
        {
          model: Table,
          as: 'Table',
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

// ===== CONFIRM BOOKING (SUPERADMIN) =====
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

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

// ===== COMPLETE BOOKING (SUPERADMIN) =====
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

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

// ===== CANCEL BOOKING (SUPERADMIN) =====
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findByPk(req.params.id);

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