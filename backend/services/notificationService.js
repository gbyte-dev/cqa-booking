const Notification = require('../models/Notification');
const { queueNotification } = require('../utils/notifications');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Live "bell" feed — recent booking activity (created/confirmed/checked-in/
// no-show/cancelled/completed), read from the same AuditLog trail already
// written by tenantBookingService. Manager/Staff only see their own venue's
// activity; Owner sees everything for the tenant.
exports.listActivityFeed = (tenantId, role, outletId, limit = 20) => {
  const where = { tenantId, entityType: 'reservation' };
  if (['manager', 'staff'].includes(role) && outletId) {
    where.outletId = outletId;
  }

  return AuditLog.findAll({
    where,
    include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'roleCode'], required: false }],
    order: [['created_at', 'DESC']],
    limit
  });
};

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
