const notificationService = require('../services/notificationService');

exports.list = async (req, res) => {
  const notifications = await notificationService.listByOrganization(req.user.organizationId);
  res.json({ success: true, data: notifications });
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
