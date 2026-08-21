const { v4: uuidv4 } = require('uuid');
const Promotion = require('../models/Promotion');
const { writeAudit } = require('../utils/audit');

exports.listByOrganization = (organizationId) => {
  return Promotion.findAll({
    where: { organizationId },
    order: [['createdAt', 'DESC']]
  });
};

exports.create = async (req) => {
  const { code, name, discountType, discountValue, startsAt, endsAt, usageLimit, minimumSpend } = req.body;

  if (!code || !name || !['fixed', 'percentage'].includes(discountType) || Number(discountValue) <= 0) {
    return { error: 'Valid promotion code, name, type and value are required', status: 400 };
  }
  if (discountType === 'percentage' && Number(discountValue) > 100) {
    return { error: 'Percentage discount cannot exceed 100', status: 400 };
  }

  const promotion = await Promotion.create({
    id: uuidv4(),
    organizationId: req.user.organizationId,
    code: code.trim().toUpperCase(),
    name,
    discountType,
    discountValue,
    startsAt,
    endsAt,
    usageLimit,
    minimumSpend
  });

  await writeAudit({ req, action: 'promotion.created', entityType: 'promotion', entityId: promotion.id });

  return { promotion };
};

exports.validate = async (req) => {
  const { code, amount } = req.body;
  const promotion = await Promotion.findOne({
    where: {
      organizationId: req.user.organizationId,
      code: String(code || '').trim().toUpperCase(),
      active: true
    }
  });

  const now = new Date();
  if (
    !promotion ||
    (promotion.startsAt && now < promotion.startsAt) ||
    (promotion.endsAt && now > promotion.endsAt) ||
    (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) ||
    Number(amount || 0) < Number(promotion?.minimumSpend || 0)
  ) {
    return { error: 'Promotion is invalid, expired, exhausted or minimum spend is not met', status: 400 };
  }

  const discount = promotion.discountType === 'percentage'
    ? Number(amount) * Number(promotion.discountValue) / 100
    : Number(promotion.discountValue);

  return {
    result: {
      promotionId: promotion.id,
      code: promotion.code,
      discount: Math.min(discount, Number(amount))
    }
  };
};

exports.update = async (req) => {
  const promotion = await Promotion.findOne({
    where: { id: req.params.id, organizationId: req.user.organizationId }
  });

  if (!promotion) return null;

  await promotion.update({ active: req.body.active });
  await writeAudit({ req, action: 'promotion.updated', entityType: 'promotion', entityId: promotion.id });

  return promotion;
};
