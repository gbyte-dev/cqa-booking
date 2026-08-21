const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const GuestPayment = require('../models/GuestPayment');
const { writeAudit } = require('../utils/audit');

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

exports.findBookingForOrg = (bookingId, organizationId) => {
  return Booking.findOne({ where: { id: bookingId, organizationId } });
};

exports.createForBooking = async (req, booking) => {
  const amount = Number(req.body.amount ?? booking.depositRequired);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Payment amount must be positive', status: 400 };
  }

  let provider = req.body.provider || 'manual';
  let providerReference = req.body.providerReference || null;
  let clientSecret = null;

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: String(req.body.currency || 'INR').toLowerCase(),
      metadata: { bookingId: booking.id, organizationId: req.user.organizationId }
    });
    provider = 'stripe';
    providerReference = intent.id;
    clientSecret = intent.client_secret;
  }

  const payment = await GuestPayment.create({
    id: uuidv4(),
    organizationId: req.user.organizationId,
    bookingId: booking.id,
    amount,
    currency: req.body.currency || 'INR',
    provider,
    providerReference,
    status: 'pending'
  });

  await writeAudit({ req, action: 'guest_payment.created', entityType: 'guest_payment', entityId: payment.id, metadata: { bookingId: booking.id } });

  return { payment, clientSecret };
};

exports.listByBooking = (bookingId, organizationId) => {
  return GuestPayment.findAll({
    where: { bookingId, organizationId },
    order: [['createdAt', 'DESC']]
  });
};

exports.findByIdForOrg = (id, organizationId) => {
  return GuestPayment.findOne({ where: { id, organizationId } });
};

exports.complete = async (req, payment) => {
  const booking = await Booking.findOne({ where: { id: payment.bookingId, organizationId: req.user.organizationId } });

  await payment.update({ status: 'paid', providerReference: req.body.providerReference || payment.providerReference });
  await booking.update({
    depositPaid: Number(booking.depositPaid || 0) + Number(payment.amount),
    depositPaymentStatus: 'paid',
    bookingStatus: Number(booking.depositRequired || 0) > 0 ? 'confirmed' : booking.bookingStatus
  });
  await writeAudit({ req, action: 'guest_payment.completed', entityType: 'guest_payment', entityId: payment.id });

  return { payment, booking };
};

exports.refund = async (req, payment) => {
  if (!payment || !['paid', 'partially_refunded'].includes(payment.status)) {
    return { error: 'Refundable payment not found', status: 400 };
  }

  const amount = Number(req.body.amount || payment.amount);
  if (amount <= 0 || amount > Number(payment.amount) - Number(payment.refundAmount || 0)) {
    return { error: 'Invalid refund amount', status: 400 };
  }

  const refunded = Number(payment.refundAmount || 0) + amount;
  await payment.update({ refundAmount: refunded, status: refunded >= Number(payment.amount) ? 'refunded' : 'partially_refunded' });
  await writeAudit({ req, action: 'guest_payment.refunded', entityType: 'guest_payment', entityId: payment.id, metadata: { amount } });

  return { payment };
};
