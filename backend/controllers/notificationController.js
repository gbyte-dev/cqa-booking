const notificationService = require('../services/notificationService');

exports.list = async (req, res) => {
  const notifications = await notificationService.listByOrganization(req.user.organizationId);
  res.json({ success: true, data: notifications });
};

exports.feed = async (req, res) => {
  try {
    const rows = await notificationService.listActivityFeed(
      req.user.organizationId,
      req.user.role,
      req.user.outletId,
      20
    );
    const data = rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityId: row.entityId,
      performedBy: row.User?.fullName || 'System',
      performedByRole: row.User?.roleCode || null,
      createdAt: row.created_at || row.createdAt
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Notification feed error:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

exports.queue = async (req, res) => {
  const { channel, event, recipient, bookingId, customerId, payload } = req.body;

  if (!['email', 'sms', 'whatsapp'].includes(channel) || !event || !recipient) {
    return res.status(400).json({ success: false, error: 'Channel, event and recipient are required' });
  }

  const notification = await notificationService.queue({
    organizationId: req.user.organizationId,
    bookingId,
    customerId,
    channel,
    event,
    recipient,
    payload
  });

  res.status(201).json({ success: true, data: notification });
};
