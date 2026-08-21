const sequelize = require('sequelize');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

// ===== ORGANIZATIONS =====

exports.listOrganizations = () => {
  return Organization.findAll({
    include: [
      {
        association: 'Subscription',
        attributes: ['id', 'plan', 'monthlyPrice', 'status']
      }
    ]
  });
};

exports.getOrganization = (id) => {
  return Organization.findByPk(id, {
    include: ['Subscription']
  });
};

exports.updateOrganization = async (id, body) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  await org.update(body);
  return org;
};

exports.suspendOrganization = async (id) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  await org.update({ subscriptionStatus: 'suspended' });
  return org;
};

exports.reactivateOrganization = async (id) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  await org.update({ subscriptionStatus: 'active' });
  return org;
};

// ===== SUBSCRIPTIONS =====

exports.getSubscriptionStats = async () => {
  const totalSubscriptions = await Subscription.count();

  const byPlan = await Subscription.findAll({
    attributes: [
      'plan',
      [sequelize.fn('COUNT', sequelize.col('*')), 'count']
    ],
    group: ['plan'],
    raw: true
  });

  const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
  const cancelledSubscriptions = await Subscription.count({ where: { status: 'cancelled' } });

  const activeWithPrices = await Subscription.findAll({
    where: { status: 'active' },
    attributes: ['monthlyPrice']
  });
  const mrr = activeWithPrices.reduce((sum, sub) => sum + sub.monthlyPrice, 0);
  const arr = mrr * 12;

  const totalRevenue = await Payment.sum('amount', { where: { paymentStatus: 'completed' } }) || 0;

  const churnedLast30Days = await Subscription.count({
    where: {
      status: 'cancelled',
      cancellationDate: {
        [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  return {
    totalSubscriptions,
    activeSubscriptions,
    cancelledSubscriptions,
    byPlan,
    mrr: Math.round(mrr),
    arr: Math.round(arr),
    totalRevenue: Math.round(totalRevenue),
    churnedLast30Days,
    churnRate: ((churnedLast30Days / totalSubscriptions) * 100).toFixed(2) + '%'
  };
};

exports.listSubscriptions = () => {
  return Subscription.findAll({
    include: [
      {
        association: 'Organization',
        attributes: ['id', 'name', 'slug', 'subscriptionStatus']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

exports.getSubscription = async (id) => {
  const subscription = await Subscription.findByPk(id, {
    include: [
      {
        association: 'Organization',
        attributes: ['id', 'name', 'slug', 'maxVenues']
      }
    ]
  });

  if (!subscription) return null;

  const payments = await Payment.findAll({
    where: { subscriptionId: subscription.id },
    order: [['createdAt', 'DESC']],
    limit: 10
  });

  return { subscription, payments };
};

const PLAN_PRICING = {
  starter: { price: 200, maxVenues: 1, maxStaff: 5, maxBookingsPerDay: 50 },
  professional: { price: 500, maxVenues: 5, maxStaff: 20, maxBookingsPerDay: 200 },
  enterprise: { price: 2000, maxVenues: 999, maxStaff: 999, maxBookingsPerDay: 9999 }
};

exports.changePlan = async (id, plan) => {
  if (!['starter', 'professional', 'enterprise'].includes(plan)) {
    return { error: 'Invalid plan', status: 400 };
  }

  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    return { error: 'Subscription not found', status: 404 };
  }

  const pricing = PLAN_PRICING[plan];
  const oldPlan = subscription.plan;
  const oldPrice = subscription.monthlyPrice;

  await subscription.update({
    plan,
    monthlyPrice: pricing.price,
    maxVenues: pricing.maxVenues,
    maxStaff: pricing.maxStaff,
    maxBookingsPerDay: pricing.maxBookingsPerDay
  });

  return {
    subscription,
    message: `Plan upgraded from ${oldPlan} ($${oldPrice}) to ${plan} ($${pricing.price})`
  };
};

exports.cancelSubscription = async (id, reason) => {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    return { error: 'Subscription not found', status: 404 };
  }

  if (subscription.status === 'cancelled') {
    return { error: 'Subscription is already cancelled', status: 400 };
  }

  await subscription.update({
    status: 'cancelled',
    cancellationDate: new Date(),
    cancellationReason: reason || 'No reason provided'
  });

  await Organization.update(
    { subscriptionStatus: 'suspended' },
    { where: { id: subscription.organizationId } }
  );

  return { subscription };
};

exports.updateAutoRenew = async (id, autoRenew) => {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) return null;

  await subscription.update({ autoRenew });
  return subscription;
};

// ===== PAYMENTS =====

exports.listPayments = () => {
  return Payment.findAll({
    include: ['Subscription']
  });
};

// ===== DASHBOARD STATS =====

exports.getDashboardStats = async () => {
  const totalOrganizations = await Organization.count();
  const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
  const totalRevenue = await Payment.sum('amount', { where: { paymentStatus: 'completed' } }) || 0;
  const totalUsers = await User.count();

  return { totalOrganizations, activeSubscriptions, totalRevenue, totalUsers };
};

exports.getBookingStats = async () => {
  const totalBookings = await Booking.count().catch(() => 0);
  const confirmedBookings = await Booking.count({ where: { bookingStatus: 'confirmed' } }).catch(() => 0);
  const cancelledBookings = await Booking.count({ where: { bookingStatus: 'cancelled' } }).catch(() => 0);
  const completedBookings = await Booking.count({ where: { bookingStatus: 'completed' } }).catch(() => 0);

  let totalGuests = 0;
  try {
    const bookings = await Booking.findAll({ attributes: ['numGuests'], raw: true });
    totalGuests = bookings.reduce((sum, b) => sum + (b.numGuests || 0), 0);
  } catch (err) {
    console.error('Error calculating guests:', err.message);
    totalGuests = 0;
  }

  const averageBookingValue = totalBookings > 0 ? Math.round(totalGuests / totalBookings) : 0;

  return {
    totalBookings: totalBookings || 0,
    confirmedBookings: confirmedBookings || 0,
    cancelledBookings: cancelledBookings || 0,
    completedBookings: completedBookings || 0,
    totalGuests: totalGuests || 0,
    averageBookingValue: averageBookingValue || 0,
    topVenue: 'All Venues'
  };
};

// ===== BOOKINGS =====

exports.listBookings = () => {
  return Booking.findAll({
    include: [
      { model: Venue, as: 'Venue', attributes: ['id', 'name', 'city'], required: false },
      { model: Table, as: 'Table', attributes: ['id', 'name', 'capacity'], required: false }
    ],
    order: [['bookingDate', 'DESC']],
    limit: 500,
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Booking fetch error:', err.message);
    return [];
  });
};

exports.getBooking = (id) => {
  return Booking.findByPk(id, {
    include: [
      { model: Venue, as: 'Venue', attributes: ['id', 'name', 'city', 'address', 'phoneNumber'], required: false },
      { model: Table, as: 'Table', attributes: ['id', 'name', 'capacity', 'tableType'], required: false }
    ],
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Booking fetch error:', err.message);
    return null;
  });
};

exports.confirmBooking = async (id) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;

  await booking.update({ bookingStatus: 'confirmed' });
  return booking;
};

exports.cancelBooking = async (id, reason) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return { error: 'Booking not found', status: 404 };

  if (booking.bookingStatus === 'cancelled') {
    return { error: 'Booking is already cancelled', status: 400 };
  }

  await booking.update({
    bookingStatus: 'cancelled',
    cancellationReason: reason || 'Cancelled by admin'
  });

  return { booking };
};

exports.completeBooking = async (id) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;

  await booking.update({ bookingStatus: 'completed' });
  return booking;
};
