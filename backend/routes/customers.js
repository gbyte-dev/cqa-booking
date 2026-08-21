const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

const router = express.Router();

// ===== GET ALL CUSTOMERS =====
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('👥 [GET /customers] Fetching customers for org:', req.user.organizationId);

    const customers = await Customer.findAll({
      where: { organizationId: req.user.organizationId },
      order: [['created_at', 'DESC']],
      raw: false,
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'customerType',
        'totalBookings',
        'totalSpent',
        'averageSpending',
        'lastBookingDate',
        'preferredContactMethod',
        'marketingConsent',
        'created_at',
        'updated_at'
      ]
    }).catch(err => {
      console.error('Database error:', err);
      return [];
    });

    console.log(`✅ Found ${customers.length} customers`);

    res.json({
      success: true,
      data: customers || [],
      count: customers.length,
      message: customers.length === 0 ? 'No customers found' : `Found ${customers.length} customer(s)`
    });
  } catch (error) {
    console.error('❌ Get customers error:', error);

    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No customers found'
    });
  }
});

router.get('/:id/loyalty', authMiddleware, async (req, res) => {
  const customer = await Customer.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId }, attributes: ['id', 'totalBookings', 'loyaltyPoints', 'customerType'] });
  if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
  res.json({ success: true, data: { customerId: customer.id, points: customer.loyaltyPoints, totalBookings: customer.totalBookings, segment: customer.totalBookings >= 5 ? 'repeat' : 'new' } });
});

// ===== GET SINGLE CUSTOMER PROFILE =====
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('👥 [GET /customers/:id] Getting customer:', req.params.id);

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Database error:', err);
      return null;
    });

    if (!customer) {
      console.log('⚠️ Customer not found');
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer found');

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('❌ Get customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Customer not found'
    });
  }
});

// ===== GET CUSTOMER BOOKINGS =====
router.get('/:id/bookings', authMiddleware, async (req, res) => {
  try {
    console.log('📋 [GET /customers/:id/bookings] Getting customer bookings:', req.params.id);

    // Check if customer exists and belongs to org
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!customer) {
      return res.json({
        success: true,
        data: [],
        stats: {},
        message: 'Customer not found'
      });
    }

    // Get bookings
    const bookings = await Booking.findAll({
      where: {
        customerId: req.params.id,
        organizationId: req.user.organizationId
      },
      include: [
        {
          model: Venue,
          as: 'Venue',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['booking_date', 'DESC']],
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Database error:', err);
      return [];
    });

    // Calculate stats
    const stats = {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.bookingStatus === 'confirmed').length,
      completedBookings: bookings.filter(b => b.bookingStatus === 'completed').length,
      cancelledBookings: bookings.filter(b => b.bookingStatus === 'cancelled').length,
      totalGuests: bookings.reduce((sum, b) => sum + (Number(b.numGuests) || 0), 0)
    };

    console.log('✅ Bookings found:', bookings.length);

    res.json({
      success: true,
      data: bookings || [],
      stats,
      message: 'Success'
    });
  } catch (error) {
    console.error('❌ Get customer bookings error:', error);

    res.json({
      success: true,
      data: [],
      stats: {},
      message: 'No bookings found'
    });
  }
});

// ===== UPDATE CUSTOMER PROFILE =====
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('👥 [PATCH /customers/:id] Updating customer:', req.params.id);

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    }).catch(err => {
      console.error('Database error:', err);
      return null;
    });

    if (!customer) {
      console.log('⚠️ Customer not found for update');
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    // Whitelist fields for update
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'customerType',
      'preferredContactMethod',
      'marketingConsent',
      'notes'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    await customer.update(updateData);

    console.log('✅ Customer updated');

    res.json({
      success: true,
      data: customer,
      message: 'Customer profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Update customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to update customer'
    });
  }
});

// ===== SUSPEND CUSTOMER (Set status in notes or use a flag) =====
router.post('/:id/suspend', authMiddleware, async (req, res) => {
  try {
    console.log('⛔ [POST /customers/:id/suspend] Suspending customer:', req.params.id);

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!customer) {
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    const { reason } = req.body;

    // Update notes with suspension info
    const suspensionNote = reason || 'Customer suspended';
    const updatedNotes = `[SUSPENDED] ${suspensionNote}\n${customer.notes || ''}`;

    await customer.update({
      notes: updatedNotes
    });

    console.log('✅ Customer suspended');

    res.json({
      success: true,
      data: customer,
      message: 'Customer suspended successfully'
    });
  } catch (error) {
    console.error('❌ Suspend customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to suspend customer'
    });
  }
});

// ===== ACTIVATE CUSTOMER =====
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    console.log('✅ [POST /customers/:id/activate] Activating customer:', req.params.id);

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!customer) {
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    // Remove suspension from notes
    const updatedNotes = customer.notes?.replace(/\[SUSPENDED\].*?\n/, '') || '';

    await customer.update({
      notes: updatedNotes
    });

    console.log('✅ Customer activated');

    res.json({
      success: true,
      data: customer,
      message: 'Customer activated successfully'
    });
  } catch (error) {
    console.error('❌ Activate customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to activate customer'
    });
  }
});

// ===== DELETE CUSTOMER =====
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ [DELETE /customers/:id] Deleting customer:', req.params.id);

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!customer) {
      return res.json({
        success: true,
        message: 'Customer not found'
      });
    }

    await customer.destroy();

    console.log('✅ Customer deleted');

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error);

    res.json({
      success: true,
      message: 'Failed to delete customer'
    });
  }
});

module.exports = router;