const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Outlet = require('../models/Outlet');
const TableDaybed = require('../models/TableDaybed');
const GuestProfile = require('../models/GuestProfile');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// ===== ORGANIZATIONS =====

exports.listOrganizations = () => {
  return Tenant.findAll({ order: [['created_at', 'DESC']] });
};

exports.getOrganization = (id) => {
  return Tenant.findByPk(id);
};

exports.updateOrganization = async (id, body) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  const ALLOWED_UPDATE_FIELDS = ['name', 'slug', 'subscriptionTier', 'stripeCustomerId'];
  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  await tenant.update(updateData);
  return tenant;
};

exports.suspendOrganization = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  await tenant.update({ isActive: false });
  return tenant;
};

exports.reactivateOrganization = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  await tenant.update({ isActive: true });
  return tenant;
};

// ===== SUBSCRIPTIONS =====
// Real `subscriptions` + `subscription_plans` tables (added 2026-08-21 via
// migration 20260821120856-create-subscriptions.js), seeded from existing tenants
// via scripts/seed-subscriptions.js. Replaces the old virtual/derived objects.

const SUB_INCLUDE = [
  { model: SubscriptionPlan, as: 'Plan' },
  { model: Tenant, as: 'Tenant', attributes: ['id', 'name', 'slug', 'isActive'] }
];

const toApiSubscription = (sub) => {
  if (!sub) return null;
  const plain = sub.toJSON ? sub.toJSON() : sub;
  return {
    ...plain,
    organizationId: plain.tenantId,
    plan: plain.Plan?.code || null,
    monthlyPrice: Number(plain.amount),
    maxVenues: plain.Plan?.maxOutlets ?? null,
    maxStaff: plain.Plan?.maxUsers ?? null,
    maxBookingsPerDay: plain.Plan?.maxReservations ?? null,
    startDate: plain.startDate,
    endDate: plain.endDate,
    Organization: plain.Tenant
      ? { id: plain.Tenant.id, name: plain.Tenant.name, slug: plain.Tenant.slug, subscriptionStatus: plain.Tenant.isActive ? 'active' : 'suspended' }
      : null
  };
};

exports.getSubscriptionStats = async () => {
  const subs = await Subscription.findAll({ include: SUB_INCLUDE });

  const totalSubscriptions = subs.length;
  const activeSubs = subs.filter(s => s.status === 'active');
  const cancelledSubs = subs.filter(s => s.status === 'cancelled');

  const byPlanMap = {};
  for (const s of subs) {
    const plan = s.Plan?.code || 'unknown';
    byPlanMap[plan] = (byPlanMap[plan] || 0) + 1;
  }
  const byPlan = Object.entries(byPlanMap).map(([plan, count]) => ({ plan, count }));

  const mrr = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const arr = mrr * 12;
  const totalRevenue = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const churnedLast30Days = cancelledSubs.filter(s => s.cancelledAt && new Date(s.cancelledAt) >= thirtyDaysAgo).length;
  const churnRate = totalSubscriptions > 0 ? ((churnedLast30Days / totalSubscriptions) * 100).toFixed(2) + '%' : '0.00%';

  return {
    totalSubscriptions,
    activeSubscriptions: activeSubs.length,
    cancelledSubscriptions: cancelledSubs.length,
    byPlan,
    mrr: Math.round(mrr),
    arr: Math.round(arr),
    totalRevenue: Math.round(totalRevenue),
    churnedLast30Days,
    churnRate
  };
};

exports.listSubscriptions = async () => {
  const subs = await Subscription.findAll({ include: SUB_INCLUDE, order: [['created_at', 'DESC']] });
  return subs.map(toApiSubscription);
};

exports.getSubscription = async (id) => {
  const sub = await Subscription.findByPk(id, { include: SUB_INCLUDE });
  if (!sub) return null;

  return { subscription: toApiSubscription(sub), payments: [] };
};

exports.changePlan = async (id, planCode) => {
  const plan = await SubscriptionPlan.findOne({ where: { code: planCode } });
  if (!plan) {
    return { error: 'Invalid plan', status: 400 };
  }

  const sub = await Subscription.findByPk(id, { include: SUB_INCLUDE });
  if (!sub) {
    return { error: 'Subscription not found', status: 404 };
  }

  const oldPlanCode = sub.Plan?.code;
  const oldPrice = Number(sub.amount);

  await sub.update({ planId: plan.id, amount: plan.price });
  await sub.reload({ include: SUB_INCLUDE });

  return {
    subscription: toApiSubscription(sub),
    message: `Plan upgraded from ${oldPlanCode} ($${oldPrice}) to ${planCode} ($${plan.price})`
  };
};

exports.cancelSubscription = async (id, reason) => {
  const sub = await Subscription.findByPk(id, { include: SUB_INCLUDE });
  if (!sub) {
    return { error: 'Subscription not found', status: 404 };
  }

  if (sub.status === 'cancelled') {
    return { error: 'Subscription is already cancelled', status: 400 };
  }

  await sub.update({ status: 'cancelled', cancelledAt: new Date(), cancellationReason: reason || 'No reason provided' });
  if (sub.tenantId) {
    await Tenant.update({ isActive: false }, { where: { id: sub.tenantId } });
  }
  await sub.reload({ include: SUB_INCLUDE });

  return { subscription: toApiSubscription(sub) };
};

exports.updateAutoRenew = async (id, autoRenew) => {
  const sub = await Subscription.findByPk(id, { include: SUB_INCLUDE });
  if (!sub) return null;

  await sub.update({ autoRenew: !!autoRenew });
  await sub.reload({ include: SUB_INCLUDE });
  return toApiSubscription(sub);
};

// ===== PAYMENTS =====
// SaaS-billing "payments" are the historical subscription records themselves
// (no separate payments/transactions ledger exists yet for platform billing —
// `guest_payments` is a different, unrelated table for booking deposits).
exports.listPayments = async (subscriptionId) => {
  const where = subscriptionId ? { id: subscriptionId } : undefined;
  const subs = await Subscription.findAll({ where, include: SUB_INCLUDE, order: [['created_at', 'DESC']] });
  return subs.map(sub => {
    const plain = sub.toJSON();
    return {
      id: plain.id,
      subscriptionId: plain.id,
      organizationId: plain.tenantId,
      organization: plain.Tenant ? { id: plain.Tenant.id, name: plain.Tenant.name, slug: plain.Tenant.slug } : null,
      amount: Number(plain.amount || 0),
      currency: plain.currency,
      status: plain.status === 'active' ? 'completed' : plain.status,
      plan: plain.Plan?.code || null,
      paymentProvider: plain.paymentProvider,
      createdAt: plain.created_at
    };
  });
};

// ===== DASHBOARD STATS =====

exports.getDashboardStats = async () => {
  const totalOrganizations = await Tenant.count();
  const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
  const activeSubs = await Subscription.findAll({ where: { status: 'active' }, attributes: ['amount'] });
  const totalRevenue = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalUsers = await User.count();

  return { totalOrganizations, activeSubscriptions, totalRevenue: Math.round(totalRevenue), totalUsers };
};

exports.getBookingStats = async () => {
  const totalBookings = await Reservation.count().catch(() => 0);
  const confirmedBookings = await Reservation.count({ where: { status: 'confirmed' } }).catch(() => 0);
  const cancelledBookings = await Reservation.count({ where: { status: 'cancelled' } }).catch(() => 0);
  const completedBookings = await Reservation.count({ where: { status: 'completed' } }).catch(() => 0);

  let totalGuests = 0;
  try {
    const reservations = await Reservation.findAll({ attributes: ['guestCount'], raw: true });
    totalGuests = reservations.reduce((sum, r) => sum + (Number(r.guestCount) || 0), 0);
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

const BOOKING_INCLUDE = [
  { model: Outlet, as: 'Outlet', attributes: ['id', 'name', 'address'], required: false },
  { model: TableDaybed, as: 'Table', attributes: ['id', 'tableNumber', 'maxCapacity'], required: false },
  { model: GuestProfile, as: 'GuestProfile', attributes: ['id', 'fullName', 'email', 'phone'], required: false }
];

exports.listBookings = () => {
  return Reservation.findAll({
    include: BOOKING_INCLUDE,
    order: [['reservation_date', 'DESC']],
    limit: 500
  }).catch(err => {
    console.error('Booking fetch error:', err.message);
    return [];
  });
};

exports.getBooking = (id) => {
  return Reservation.findByPk(id, {
    include: BOOKING_INCLUDE
  }).catch(err => {
    console.error('Booking fetch error:', err.message);
    return null;
  });
};

exports.confirmBooking = async (id) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return null;

  await booking.update({ status: 'confirmed' });
  return booking;
};

exports.cancelBooking = async (id, reason) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return { error: 'Booking not found', status: 404 };

  if (booking.status === 'cancelled') {
    return { error: 'Booking is already cancelled', status: 400 };
  }

  await booking.update({
    status: 'cancelled',
    cancellationReason: reason || 'Cancelled by admin'
  });

  return { booking };
};

exports.completeBooking = async (id) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return null;

  await booking.update({ status: 'completed' });
  return booking;
};
