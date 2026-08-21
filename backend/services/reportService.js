const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const GuestPayment = require('../models/GuestPayment');

function csv(rows, columns) {
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [columns.join(','), ...rows.map(row => columns.map(column => escape(row[column])).join(','))].join('\n');
}

exports.bookingsCsv = async (organizationId) => {
  const rows = await Booking.findAll({ where: { organizationId }, raw: true, order: [['bookingDate', 'DESC']] });
  return csv(rows, ['id', 'venueId', 'customerName', 'customerEmail', 'bookingDate', 'bookingStartTime', 'bookingEndTime', 'numGuests', 'bookingStatus', 'totalAmount', 'depositPaid']);
};

exports.customersCsv = async (organizationId) => {
  const rows = await Customer.findAll({ where: { organizationId }, raw: true });
  return csv(rows, ['id', 'firstName', 'lastName', 'email', 'phone', 'customerType', 'totalBookings', 'totalSpent', 'lastBookingDate']);
};

exports.paymentsCsv = async (organizationId) => {
  const rows = await GuestPayment.findAll({ where: { organizationId }, raw: true });
  return csv(rows, ['id', 'bookingId', 'amount', 'currency', 'status', 'provider', 'providerReference', 'createdAt']);
};
