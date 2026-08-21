const express = require('express');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Promotion = require('../models/Promotion');
const { writeAudit } = require('../utils/audit');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const promotions = await Promotion.findAll({ where: { organizationId: req.user.organizationId }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: promotions });
});

router.post('/', async (req, res) => {
  try {
    const { code, name, discountType, discountValue, startsAt, endsAt, usageLimit, minimumSpend } = req.body;
    if (!code || !name || !['fixed', 'percentage'].includes(discountType) || Number(discountValue) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid promotion code, name, type and value are required' });
    }
    if (discountType === 'percentage' && Number(discountValue) > 100) {
      return res.status(400).json({ success: false, error: 'Percentage discount cannot exceed 100' });
    }
    const promotion = await Promotion.create({ id: uuidv4(), organizationId: req.user.organizationId, code: code.trim().toUpperCase(), name, discountType, discountValue, startsAt, endsAt, usageLimit, minimumSpend });
    await writeAudit({ req, action: 'promotion.created', entityType: 'promotion', entityId: promotion.id });
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/validate', async (req, res) => {
  const { code, amount } = req.body;
  const promotion = await Promotion.findOne({ where: { organizationId: req.user.organizationId, code: String(code || '').trim().toUpperCase(), active: true } });
  const now = new Date();
  if (!promotion || (promotion.startsAt && now < promotion.startsAt) || (promotion.endsAt && now > promotion.endsAt) || (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) || Number(amount || 0) < Number(promotion?.minimumSpend || 0)) {
    return res.status(400).json({ success: false, error: 'Promotion is invalid, expired, exhausted or minimum spend is not met' });
  }
  const discount = promotion.discountType === 'percentage' ? Number(amount) * Number(promotion.discountValue) / 100 : Number(promotion.discountValue);
  res.json({ success: true, data: { promotionId: promotion.id, code: promotion.code, discount: Math.min(discount, Number(amount)) } });
});

router.patch('/:id', async (req, res) => {
  const promotion = await Promotion.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
  if (!promotion) return res.status(404).json({ success: false, error: 'Promotion not found' });
  await promotion.update({ active: req.body.active });
  await writeAudit({ req, action: 'promotion.updated', entityType: 'promotion', entityId: promotion.id });
  res.json({ success: true, data: promotion });
});

module.exports = router;
