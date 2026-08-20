const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const Organization = require('../models/Organization');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ===== SUPER ADMIN MIDDLEWARE =====
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

// ===== GET ALL ORGANIZATIONS =====
router.get('/organizations', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 Fetching all organizations...');
    
    const organizations = await Organization.findAll({
      include: [
        {
          association: 'Subscription',
          attributes: ['id', 'plan', 'monthlyPrice', 'status']
        }
      ]
    });

    console.log(`✅ Found ${organizations.length} organizations`);

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET ORGANIZATION DETAILS =====
router.get('/organizations/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id, {
      include: ['Subscription']
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: org
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== UPDATE ORGANIZATION =====
router.patch('/organizations/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await org.update(req.body);

    res.json({
      success: true,
      data: org
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== SUSPEND ORGANIZATION =====
router.post('/organizations/:id/suspend', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await org.update({
      subscriptionStatus: 'suspended'
    });

    res.json({
      success: true,
      message: 'Organization suspended'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== REACTIVATE ORGANIZATION =====
router.post('/organizations/:id/reactivate', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await org.update({
      subscriptionStatus: 'active'
    });

    res.json({
      success: true,
      message: 'Organization reactivated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET SUBSCRIPTION STATS =====
router.get('/subscriptions/stats', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 [GET /subscriptions/stats] Calculating subscription stats...');

    // Total subscriptions
    const totalSubscriptions = await Subscription.count();

    // By plan
    const byPlan = await Subscription.findAll({
      attributes: [
        'plan',
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      group: ['plan'],
      raw: true
    });

    // Active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });

    // Cancelled subscriptions
    const cancelledSubscriptions = await Subscription.count({
      where: { status: 'cancelled' }
    });

    // MRR (Monthly Recurring Revenue)
    const activeWithPrices = await Subscription.findAll({
      where: { status: 'active' },
      attributes: ['monthlyPrice']
    });
    const mrr = activeWithPrices.reduce((sum, sub) => sum + sub.monthlyPrice, 0);

    // ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Total revenue collected
    const totalRevenue = await Payment.sum('amount', {
      where: { paymentStatus: 'completed' }
    }) || 0;

    // Churn rate
    const churnedLast30Days = await Subscription.count({
      where: {
        status: 'cancelled',
        cancellationDate: {
          [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log('✅ Stats calculated');

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        byPlan,
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        totalRevenue: Math.round(totalRevenue),
        churnedLast30Days,
        churnRate: ((churnedLast30Days / totalSubscriptions) * 100).toFixed(2) + '%'
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
// ===== GET ALL SUBSCRIPTIONS =====
// router.get('/subscriptions', authMiddleware, superAdminMiddleware, async (req, res) => {
//   try {
//     const subscriptions = await Subscription.findAll({
//       include: ['Organization']
//     });

//     res.json({
//       success: true,
//       data: subscriptions
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });
// ===== GET ALL SUBSCRIPTIONS =====
router.get('/subscriptions', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('💳 [GET /subscriptions] Fetching all subscriptions...');

    const subscriptions = await Subscription.findAll({
      include: [
        {
          association: 'Organization',
          attributes: ['id', 'name', 'slug', 'subscriptionStatus']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// ===== GET SUBSCRIPTION DETAILS =====
router.get('/subscriptions/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('💳 [GET /subscriptions/:id] Getting subscription:', req.params.id);

    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          association: 'Organization',
          attributes: ['id', 'name', 'slug', 'maxVenues']
        }
      ]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Get payment history
    const payments = await Payment.findAll({
      where: { subscriptionId: subscription.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log('✅ Subscription found');

    res.json({
      success: true,
      data: subscription,
      payments
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CHANGE PLAN =====
router.post('/subscriptions/:id/change-plan', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 [POST /subscriptions/:id/change-plan] Changing plan');

    const { plan } = req.body;

    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    const pricingMap = {
      starter: { 
        price: 200, 
        maxVenues: 1, 
        maxStaff: 5, 
        maxBookingsPerDay: 50 
      },
      professional: { 
        price: 500, 
        maxVenues: 5, 
        maxStaff: 20, 
        maxBookingsPerDay: 200 
      },
      enterprise: { 
        price: 2000, 
        maxVenues: 999, 
        maxStaff: 999, 
        maxBookingsPerDay: 9999 
      }
    };

    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    const pricing = pricingMap[plan];

    // Record the plan change
    const oldPlan = subscription.plan;
    const oldPrice = subscription.monthlyPrice;

    await subscription.update({
      plan,
      monthlyPrice: pricing.price,
      maxVenues: pricing.maxVenues,
      maxStaff: pricing.maxStaff,
      maxBookingsPerDay: pricing.maxBookingsPerDay
    });

    console.log('✅ Plan changed from', oldPlan, 'to', plan);

    res.json({
      success: true,
      data: subscription,
      message: `Plan upgraded from ${oldPlan} ($${oldPrice}) to ${plan} ($${pricing.price})`
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CANCEL SUBSCRIPTION =====
router.post('/subscriptions/:id/cancel', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('❌ [POST /subscriptions/:id/cancel] Cancelling subscription');

    const { reason } = req.body;

    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is already cancelled'
      });
    }

    await subscription.update({
      status: 'cancelled',
      cancellationDate: new Date(),
      cancellationReason: reason || 'No reason provided'
    });

    // Suspend the organization
    await Organization.update(
      { subscriptionStatus: 'suspended' },
      { where: { id: subscription.organizationId } }
    );

    console.log('✅ Subscription cancelled');

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled and organization suspended'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// ===== UPGRADE/DOWNGRADE SUBSCRIPTION =====
// router.post('/subscriptions/:id/change-plan', authMiddleware, superAdminMiddleware, async (req, res) => {
//   try {
//     const { plan } = req.body;

//     if (!['starter', 'professional', 'enterprise'].includes(plan)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid plan'
//       });
//     }

//     // Plan pricing
//     const pricingMap = {
//       starter: { price: 200, maxVenues: 1, maxStaff: 5, maxBookingsPerDay: 50 },
//       professional: { price: 500, maxVenues: 5, maxStaff: 20, maxBookingsPerDay: 200 },
//       enterprise: { price: 2000, maxVenues: 999, maxStaff: 999, maxBookingsPerDay: 9999 }
//     };

//     const subscription = await Subscription.findByPk(req.params.id);

//     if (!subscription) {
//       return res.status(404).json({
//         success: false,
//         error: 'Subscription not found'
//       });
//     }

//     const pricing = pricingMap[plan];

//     await subscription.update({
//       plan,
//       monthlyPrice: pricing.price,
//       maxVenues: pricing.maxVenues,
//       maxStaff: pricing.maxStaff,
//       maxBookingsPerDay: pricing.maxBookingsPerDay
//     });

//     res.json({
//       success: true,
//       data: subscription,
//       message: `Plan changed to ${plan}`
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });
// ===== UPDATE AUTO-RENEW =====
router.patch('/subscriptions/:id/auto-renew', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🔄 [PATCH /subscriptions/:id/auto-renew] Updating auto-renew');

    const { autoRenew } = req.body;

    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    await subscription.update({ autoRenew });

    console.log('✅ Auto-renew updated to', autoRenew);

    res.json({
      success: true,
      data: subscription,
      message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// ===== CANCEL SUBSCRIPTION =====
// router.post('/subscriptions/:id/cancel', authMiddleware, superAdminMiddleware, async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const subscription = await Subscription.findByPk(req.params.id);

//     if (!subscription) {
//       return res.status(404).json({
//         success: false,
//         error: 'Subscription not found'
//       });
//     }

//     await subscription.update({
//       status: 'cancelled',
//       cancellationDate: new Date(),
//       cancellationReason: reason
//     });

//     res.json({
//       success: true,
//       message: 'Subscription cancelled'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// ===== GET ALL PAYMENTS =====
router.get('/payments', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: ['Subscription']
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== ADMIN DASHBOARD STATS =====
router.get('/dashboard/stats', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 Calculating dashboard stats...');

    // Total Organizations
    const totalOrganizations = await Organization.count();
    console.log(`✅ Total Organizations: ${totalOrganizations}`);

    // Active Subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });
    console.log(`✅ Active Subscriptions: ${activeSubscriptions}`);

    // Total Revenue
    const totalRevenue = await Payment.sum('amount', {
      where: { paymentStatus: 'completed' }
    }) || 0;
    console.log(`✅ Total Revenue: ${totalRevenue}`);

    // Total Users
    const totalUsers = await User.count();
    console.log(`✅ Total Users: ${totalUsers}`);

    res.json({
      success: true,
      data: {
        totalOrganizations,
        activeSubscriptions,
        totalRevenue,
        totalUsers
      }
    });
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/bookings/stats', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 [GET /bookings/stats] Calculating booking stats...');

    const Booking = require('../models/Booking');

    // Total bookings
    const totalBookings = await Booking.count().catch(() => 0);

    // By status
    const confirmedBookings = await Booking.count({
      where: { bookingStatus: 'confirmed' }
    }).catch(() => 0);

    const cancelledBookings = await Booking.count({
      where: { bookingStatus: 'cancelled' }
    }).catch(() => 0);

    const completedBookings = await Booking.count({
      where: { bookingStatus: 'completed' }
    }).catch(() => 0);

    // Total guests
    let totalGuests = 0;
    try {
      const bookings = await Booking.findAll({
        attributes: ['numGuests'],
        raw: true
      });
      totalGuests = bookings.reduce((sum, b) => sum + (b.numGuests || 0), 0);
    } catch (err) {
      console.error('Error calculating guests:', err.message);
      totalGuests = 0;
    }

    // Average booking value
    const averageBookingValue = totalBookings > 0 ? Math.round(totalGuests / totalBookings) : 0;

    console.log('✅ Booking stats calculated');

    res.json({
      success: true,
      data: {
        totalBookings: totalBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        cancelledBookings: cancelledBookings || 0,
        completedBookings: completedBookings || 0,
        totalGuests: totalGuests || 0,
        averageBookingValue: averageBookingValue || 0,
        topVenue: 'All Venues'
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(200).json({
      success: true,
      data: {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0,
        topVenue: 'All Venues'
      }
    });
  }
});

// ===== GET ALL BOOKINGS =====
router.get('/bookings', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📋 [GET /bookings] Fetching all bookings...');

    const Booking = require('../models/Booking');
    const Venue = require('../models/Venue');
    const Table = require('../models/Table');

    const bookings = await Booking.findAll({
      include: [
        {
          model: Venue,
          as: 'Venue',
          attributes: ['id', 'name', 'city'],
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
      limit: 500,
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Booking fetch error:', err.message);
      return [];
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      success: true,
      data: bookings || [],
      count: bookings.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  }
});

// ===== GET BOOKING DETAILS =====
router.get('/bookings/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📋 [GET /bookings/:id] Getting booking:', req.params.id);

    const Booking = require('../models/Booking');
    const Venue = require('../models/Venue');
    const Table = require('../models/Table');

    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Venue,
          as: 'Venue',
          attributes: ['id', 'name', 'city', 'address', 'phoneNumber'],
          required: false
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'name', 'capacity', 'tableType'],
          required: false
        }
      ],
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Booking fetch error:', err.message);
      return null;
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    console.log('✅ Booking found');

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CONFIRM BOOKING =====
router.post('/bookings/:id/confirm', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✅ [POST /bookings/:id/confirm] Confirming booking');

    const Booking = require('../models/Booking');

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await booking.update({ bookingStatus: 'confirmed' });

    console.log('✅ Booking confirmed');

    res.json({
      success: true,
      data: booking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CANCEL BOOKING =====
router.post('/bookings/:id/cancel', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('❌ [POST /bookings/:id/cancel] Cancelling booking');

    const { reason } = req.body;
    const Booking = require('../models/Booking');

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    await booking.update({
      bookingStatus: 'cancelled',
      cancellationReason: reason || 'Cancelled by admin'
    });

    console.log('✅ Booking cancelled');

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== COMPLETE BOOKING =====
router.post('/bookings/:id/complete', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✔️ [POST /bookings/:id/complete] Completing booking');

    const Booking = require('../models/Booking');

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await booking.update({ bookingStatus: 'completed' });

    console.log('✅ Booking completed');

    res.json({
      success: true,
      data: booking,
      message: 'Booking marked as completed'
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