const Notification = require('../models/Notification');

async function queueNotification({ organizationId, bookingId, customerId, channel, event, recipient, payload }) {
  return Notification.create({ organizationId, bookingId, customerId, channel, event, recipient, payload, status: 'queued' });
}

module.exports = { queueNotification };
