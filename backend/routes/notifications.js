const express = require('express');
const authMiddleware = require('../middleware/auth');
const Notification = require('../models/Notification');
const { queueNotification } = require('../utils/notifications');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const notifications = await Notification.findAll({ where: { organizationId: req.user.organizationId }, order: [['createdAt', 'DESC']], limit: 100 });
  res.json({ success: true, data: notifications });
});

router.post('/queue', async (req, res) => {
  const { channel, event, recipient, bookingId, customerId, payload } = req.body;
  if (!['email', 'sms', 'whatsapp'].includes(channel) || !event || !recipient) return res.status(400).json({ success: false, error: 'Channel, event and recipient are required' });
  const notification = await queueNotification({ organizationId: req.user.organizationId, bookingId, customerId, channel, event, recipient, payload });
  res.status(201).json({ success: true, data: notification });
});

module.exports = router;
