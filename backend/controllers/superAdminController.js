const superAdminService = require('../services/superAdminService');

// ===== ORGANIZATIONS =====

exports.listOrganizations = async (req, res) => {
  try {
    console.log('📊 Fetching all organizations...');

    const organizations = await superAdminService.listOrganizations();

    console.log(`✅ Found ${organizations.length} organizations`);

    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const org = await superAdminService.getOrganization(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const org = await superAdminService.updateOrganization(req.params.id, req.body);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.suspendOrganization = async (req, res) => {
  try {
    const org = await superAdminService.suspendOrganization(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, message: 'Organization suspended' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reactivateOrganization = async (req, res) => {
  try {
    const org = await superAdminService.reactivateOrganization(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, message: 'Organization reactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== SUBSCRIPTIONS =====

exports.getSubscriptionStats = async (req, res) => {
  try {
    console.log('📊 [GET /subscriptions/stats] Calculating subscription stats...');

    const stats = await superAdminService.getSubscriptionStats();

    console.log('✅ Stats calculated');

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listSubscriptions = async (req, res) => {
  try {
    console.log('💳 [GET /subscriptions] Fetching all subscriptions...');

    const subscriptions = await superAdminService.listSubscriptions();

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    res.json({ success: true, data: subscriptions, count: subscriptions.length });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    console.log('💳 [GET /subscriptions/:id] Getting subscription:', req.params.id);

    const result = await superAdminService.getSubscription(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    console.log('✅ Subscription found');

    res.json({ success: true, data: result.subscription, payments: result.payments });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.changePlan = async (req, res) => {
  try {
    console.log('📊 [POST /subscriptions/:id/change-plan] Changing plan');

    const result = await superAdminService.changePlan(req.params.id, req.body.plan);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    console.log('✅ Plan changed to', req.body.plan);

    res.json({ success: true, data: result.subscription, message: result.message });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    console.log('❌ [POST /subscriptions/:id/cancel] Cancelling subscription');

    const result = await superAdminService.cancelSubscription(req.params.id, req.body.reason);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    console.log('✅ Subscription cancelled');

    res.json({ success: true, data: result.subscription, message: 'Subscription cancelled and organization suspended' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAutoRenew = async (req, res) => {
  try {
    console.log('🔄 [PATCH /subscriptions/:id/auto-renew] Updating auto-renew');

    const subscription = await superAdminService.updateAutoRenew(req.params.id, req.body.autoRenew);

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    console.log('✅ Auto-renew updated to', req.body.autoRenew);

    res.json({ success: true, data: subscription, message: `Auto-renew ${req.body.autoRenew ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== PAYMENTS =====

exports.listPayments = async (req, res) => {
  try {
    const payments = await superAdminService.listPayments();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== DASHBOARD STATS =====

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Calculating dashboard stats...');

    const stats = await superAdminService.getDashboardStats();

    console.log(`✅ Total Organizations: ${stats.totalOrganizations}`);
    console.log(`✅ Active Subscriptions: ${stats.activeSubscriptions}`);
    console.log(`✅ Total Revenue: ${stats.totalRevenue}`);
    console.log(`✅ Total Users: ${stats.totalUsers}`);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    console.log('📊 [GET /bookings/stats] Calculating booking stats...');

    const stats = await superAdminService.getBookingStats();

    console.log('✅ Booking stats calculated');

    res.json({ success: true, data: stats });
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
};

// ===== BOOKINGS =====

exports.listBookings = async (req, res) => {
  try {
    console.log('📋 [GET /bookings] Fetching all bookings...');

    const bookings = await superAdminService.listBookings();

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({ success: true, data: bookings || [], count: bookings.length });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(200).json({ success: true, data: [], count: 0 });
  }
};

exports.getBooking = async (req, res) => {
  try {
    console.log('📋 [GET /bookings/:id] Getting booking:', req.params.id);

    const booking = await superAdminService.getBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    console.log('✅ Booking found');

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    console.log('✅ [POST /bookings/:id/confirm] Confirming booking');

    const booking = await superAdminService.confirmBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    console.log('✅ Booking confirmed');

    res.json({ success: true, data: booking, message: 'Booking confirmed successfully' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    console.log('❌ [POST /bookings/:id/cancel] Cancelling booking');

    const result = await superAdminService.cancelBooking(req.params.id, req.body.reason);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    console.log('✅ Booking cancelled');

    res.json({ success: true, data: result.booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    console.log('✔️ [POST /bookings/:id/complete] Completing booking');

    const booking = await superAdminService.completeBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    console.log('✅ Booking completed');

    res.json({ success: true, data: booking, message: 'Booking marked as completed' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
