const reportService = require('../services/reportService');

exports.bookingsCsv = async (req, res) => {
  const csv = await reportService.bookingsCsv(req.user.organizationId);
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="bookings.csv"').send(csv);
};

exports.customersCsv = async (req, res) => {
  const csv = await reportService.customersCsv(req.user.organizationId);
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="customers.csv"').send(csv);
};

exports.paymentsCsv = async (req, res) => {
  const csv = await reportService.paymentsCsv(req.user.organizationId);
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="payments.csv"').send(csv);
};
