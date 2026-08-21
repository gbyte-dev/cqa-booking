const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const GuestPayment = require('../models/GuestPayment');
const { writeAudit } = require('../utils/audit');

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const router = express.Router();
router.use(authMiddleware);

router.post('/booking/:bookingId', async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.bookingId, organizationId: req.user.organizationId } });
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
  const amount = Number(req.body.amount ?? booking.depositRequired);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'Payment amount must be positive' });
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
  const payment = await GuestPayment.create({ id: uuidv4(), organizationId: req.user.organizationId, bookingId: booking.id, amount, currency: req.body.currency || 'INR', provider, providerReference, status: 'pending' });
  await writeAudit({ req, action: 'guest_payment.created', entityType: 'guest_payment', entityId: payment.id, metadata: { bookingId: booking.id } });
  res.status(201).json({ success: true, data: payment, clientSecret });
});

router.get('/booking/:bookingId', async (req, res) => {
  const payments = await GuestPayment.findAll({ where: { bookingId: req.params.bookingId, organizationId: req.user.organizationId }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: payments });
});

router.post('/:id/complete', async (req, res) => {
  const payment = await GuestPayment.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
  if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
  const booking = await Booking.findOne({ where: { id: payment.bookingId, organizationId: req.user.organizationId } });
  await payment.update({ status: 'paid', providerReference: req.body.providerReference || payment.providerReference });
  await booking.update({ depositPaid: Number(booking.depositPaid || 0) + Number(payment.amount), depositPaymentStatus: 'paid', bookingStatus: Number(booking.depositRequired || 0) > 0 ? 'confirmed' : booking.bookingStatus });
  await writeAudit({ req, action: 'guest_payment.completed', entityType: 'guest_payment', entityId: payment.id });
  res.json({ success: true, data: payment, booking });
});

router.post('/:id/refund', async (req, res) => {
  const payment = await GuestPayment.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
  if (!payment || !['paid', 'partially_refunded'].includes(payment.status)) return res.status(400).json({ success: false, error: 'Refundable payment not found' });
  const amount = Number(req.body.amount || payment.amount);
  if (amount <= 0 || amount > Number(payment.amount) - Number(payment.refundAmount || 0)) return res.status(400).json({ success: false, error: 'Invalid refund amount' });
  const refunded = Number(payment.refundAmount || 0) + amount;
  await payment.update({ refundAmount: refunded, status: refunded >= Number(payment.amount) ? 'refunded' : 'partially_refunded' });
  await writeAudit({ req, action: 'guest_payment.refunded', entityType: 'guest_payment', entityId: payment.id, metadata: { amount } });
  res.json({ success: true, data: payment });
});

module.exports = router;
