const express = require('express');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const GuestPayment = require('../models/GuestPayment');

const router = express.Router();
router.use(authMiddleware);

function csv(rows, columns) {
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [columns.join(','), ...rows.map(row => columns.map(column => escape(row[column])).join(','))].join('\n');
}

router.get('/bookings.csv', async (req, res) => {
  const rows = await Booking.findAll({ where: { organizationId: req.user.organizationId }, raw: true, order: [['bookingDate', 'DESC']] });
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="bookings.csv"').send(csv(rows, ['id', 'venueId', 'customerName', 'customerEmail', 'bookingDate', 'bookingStartTime', 'bookingEndTime', 'numGuests', 'bookingStatus', 'totalAmount', 'depositPaid']));
});

router.get('/customers.csv', async (req, res) => {
  const rows = await Customer.findAll({ where: { organizationId: req.user.organizationId }, raw: true });
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="customers.csv"').send(csv(rows, ['id', 'firstName', 'lastName', 'email', 'phone', 'customerType', 'totalBookings', 'totalSpent', 'lastBookingDate']));
});

router.get('/payments.csv', async (req, res) => {
  const rows = await GuestPayment.findAll({ where: { organizationId: req.user.organizationId }, raw: true });
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="payments.csv"').send(csv(rows, ['id', 'bookingId', 'amount', 'currency', 'status', 'provider', 'providerReference', 'createdAt']));
});

module.exports = router;
