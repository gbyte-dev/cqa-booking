const Notification = require('../models/Notification');
const { queueNotification } = require('../utils/notifications');

exports.listByOrganization = (organizationId) => {
  return Notification.findAll({
    where: { organizationId },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
};

exports.queue = ({ organizationId, bookingId, customerId, channel, event, recipient, payload }) => {
  return queueNotification({ organizationId, bookingId, customerId, channel, event, recipient, payload });
};
