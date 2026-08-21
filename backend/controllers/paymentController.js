const paymentService = require('../services/paymentService');

exports.create = async (req, res) => {
  const booking = await paymentService.findBookingForOrg(req.params.bookingId, req.user.organizationId);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

  const result = await paymentService.createForBooking(req, booking);

  if (result.error) {
    return res.status(result.status).json({ success: false, error: result.error });
  }

  res.status(201).json({ success: true, data: result.payment, clientSecret: result.clientSecret });
};

exports.listByBooking = async (req, res) => {
  const payments = await paymentService.listByBooking(req.params.bookingId, req.user.organizationId);
  res.json({ success: true, data: payments });
};

exports.complete = async (req, res) => {
  const payment = await paymentService.findByIdForOrg(req.params.id, req.user.organizationId);
  if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

  const result = await paymentService.complete(req, payment);
  res.json({ success: true, data: result.payment, booking: result.booking });
};

exports.refund = async (req, res) => {
  const payment = await paymentService.findByIdForOrg(req.params.id, req.user.organizationId);

  const result = await paymentService.refund(req, payment);

  if (result.error) {
    return res.status(result.status).json({ success: false, error: result.error });
  }

  res.json({ success: true, data: result.payment });
};
