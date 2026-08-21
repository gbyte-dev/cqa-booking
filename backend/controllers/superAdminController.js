const superAdminService = require('../services/superAdminService');

const toApiShape = (tenant) => {
  if (!tenant) return null;
  const plain = tenant.toJSON ? tenant.toJSON() : tenant;
  return {
    ...plain,
    timezone: 'UTC',
    maxVenues: null,
    subscriptionStatus: plain.isActive ? 'active' : 'suspended',
    Subscription: {
      plan: plain.subscriptionTier || 'core',
      monthlyPrice: 0,
      status: plain.isActive ? 'active' : 'suspended'
    }
  };
};

const bookingToApiShape = (booking) => {
  if (!booking) return null;
  const plain = booking.toJSON ? booking.toJSON() : booking;
  return {
    ...plain,
    venueId: plain.outletId,
    tableId: plain.tableId,
    customerId: plain.guestProfileId,
    customerName: plain.GuestProfile?.fullName || '',
    customerEmail: plain.GuestProfile?.email || null,
    customerPhone: plain.GuestProfile?.phone || null,
    bookingDate: plain.reservationDate,
    bookingStartTime: plain.startTime,
    bookingEndTime: plain.endTime,
    numGuests: plain.guestCount,
    bookingStatus: plain.status,
    notes: plain.specialRequests,
    Venue: plain.Outlet ? { id: plain.Outlet.id, name: plain.Outlet.name, city: '', address: plain.Outlet.address } : null,
    Table: plain.Table ? { id: plain.Table.id, name: plain.Table.tableNumber, capacity: plain.Table.maxCapacity } : null
  };
};

// ===== ORGANIZATIONS =====

exports.listOrganizations = async (req, res) => {
  try {
    console.log('📊 Fetching all organizations...');

    const organizations = await superAdminService.listOrganizations();
    const data = organizations.map(toApiShape);

    console.log(`✅ Found ${data.length} organizations`);

    res.json({ success: true, data });
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

    res.json({ success: true, data: toApiShape(org) });
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

    res.json({ success: true, data: toApiShape(org) });
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

const paymentToApiShape = (p) => ({
  ...p,
  paymentStatus: p.status,
  paymentReference: p.id,
  paymentMethod: p.paymentProvider || 'subscription',
  Organization: p.organization,
  Booking: null
});

exports.listPayments = async (req, res) => {
  try {
    const payments = await superAdminService.listPayments(req.query.subscriptionId);
    res.json({ success: true, data: payments.map(paymentToApiShape) });
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
    const data = bookings.map(bookingToApiShape);

    console.log(`✅ Found ${data.length} bookings`);

    res.json({ success: true, data: data || [], count: data.length });
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

    res.json({ success: true, data: bookingToApiShape(booking) });
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

    res.json({ success: true, data: bookingToApiShape(booking), message: 'Booking confirmed successfully' });
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

    res.json({ success: true, data: bookingToApiShape(result.booking), message: 'Booking cancelled successfully' });
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

    res.json({ success: true, data: bookingToApiShape(booking), message: 'Booking marked as completed' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
