const { v4: uuidv4 } = require('uuid');
const Tenant = require('../models/Tenant');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.listAll = () => {
  return Tenant.findAll({
    order: [['created_at', 'DESC']]
  });
};

exports.getById = (id) => {
  return Tenant.findByPk(id);
};

exports.findBySlug = (slug) => {
  return Tenant.findOne({ where: { slug } });
};

exports.create = async ({ name, slug, subscriptionTier }) => {
  const tenantId = uuidv4();
  await Tenant.create({
    id: tenantId,
    name,
    slug,
    subscriptionTier: subscriptionTier || 'core',
    isActive: true
  });

  // Every organization must have a Subscription row from the moment it's
  // created, so Monthly Fee is never a silent $0 for a valid, unrelated reason.
  const plan = await SubscriptionPlan.findOne({ where: { code: subscriptionTier || 'core' } });
  if (plan) {
    await Subscription.create({
      id: uuidv4(),
      tenantId,
      planId: plan.id,
      status: 'active',
      startDate: new Date(),
      amount: plan.price,
      currency: plan.currency
    });
  }

  return Tenant.findByPk(tenantId);
};

exports.update = async (id, body) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  if (body.slug && body.slug !== tenant.slug) {
    const existing = await Tenant.findOne({ where: { slug: body.slug } });
    if (existing) {
      return { slugConflict: true };
    }
  }

  const ALLOWED_UPDATE_FIELDS = ['name', 'slug', 'subscriptionTier', 'stripeCustomerId'];
  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  await tenant.update(updateData);
  return { org: tenant };
};

exports.remove = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return false;

  await tenant.destroy();
  return true;
};

exports.suspend = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  await tenant.update({ isActive: false });
  return tenant;
};

exports.reactivate = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) return null;

  await tenant.update({ isActive: true });
  return tenant;
};
