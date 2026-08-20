const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Organization = require('../models/Organization');
const Venue = require('../models/Venue');
const Table = require('../models/Table');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ===== MIDDLEWARE: CHECK SUPER ADMIN =====
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

// ===== GET ALL CUSTOMERS =====
router.get('/customers', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('👥 [GET /users/customers] Fetching all customers...');

    const customers = await User.findAll({
      where: { role: 'customer' },
      include: [
        {
          association: 'Organization',
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${customers.length} customers`);

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET SINGLE USER =====
router.get('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('👥 [GET /users/:id] Getting user:', req.params.id);

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          association: 'Organization',
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User found:', user.email);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET CUSTOMER BOOKINGS =====
router.get('/:id/bookings', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📋 [GET /users/:id/bookings] Getting bookings for user:', req.params.id);

    const bookings = await Booking.findAll({
      where: { userId: req.params.id },
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city']
        },
        {
          model: Table,
          attributes: ['id', 'name', 'capacity', 'tableType']
        }
      ],
      order: [['bookingDate', 'DESC']]
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    // Calculate stats
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalGuests = bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);

    res.json({
      success: true,
      data: bookings,
      stats: {
        totalBookings,
        cancelledBookings,
        completedBookings,
        totalGuests
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== UPDATE USER =====
router.patch('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✏️ [PATCH /users/:id] Updating user:', req.params.id);

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Only allow certain fields to be updated
    const allowedFields = ['firstName', 'lastName', 'emailVerified'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await user.update(updateData);

    console.log('✅ User updated:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== DELETE USER =====
router.delete('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🗑️ [DELETE /users/:id] Deleting user:', req.params.id);

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user's bookings first
    await Booking.destroy({
      where: { userId: user.id }
    });

    await user.destroy();

    console.log('✅ User deleted:', req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== SUSPEND USER =====
router.post('/:id/suspend', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🔒 [POST /users/:id/suspend] Suspending user:', req.params.id);

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.update({ status: 'suspended' });

    console.log('✅ User suspended:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== REACTIVATE USER =====
router.post('/:id/reactivate', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✅ [POST /users/:id/reactivate] Reactivating user:', req.params.id);

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.update({ status: 'active' });

    console.log('✅ User reactivated:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;