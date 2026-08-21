const { v4: uuidv4 } = require('uuid');
const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');

const SUBSCRIPTION_INCLUDE = [
  {
    association: 'Subscription',
    attributes: ['id', 'plan', 'monthlyPrice', 'status']
  }
];

exports.listAll = () => {
  return Organization.findAll({
    include: SUBSCRIPTION_INCLUDE,
    order: [['createdAt', 'DESC']]
  });
};

exports.getById = (id) => {
  return Organization.findByPk(id, {
    include: SUBSCRIPTION_INCLUDE
  });
};

exports.findBySlug = (slug) => {
  return Organization.findOne({ where: { slug } });
};

exports.create = async ({ name, slug, timezone, maxVenues }) => {
  const orgId = uuidv4();
  await Organization.create({
    id: orgId,
    name,
    slug,
    timezone: timezone || 'UTC',
    maxVenues: maxVenues || 1,
    subscriptionStatus: 'active'
  });

  await Subscription.create({
    id: uuidv4(),
    organizationId: orgId,
    plan: 'starter',
    monthlyPrice: 200,
    maxVenues: 1,
    maxStaff: 5,
    maxBookingsPerDay: 50,
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoRenew: true
  });

  return Organization.findByPk(orgId, {
    include: ['Subscription']
  });
};

exports.update = async (id, body) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  if (body.slug && body.slug !== org.slug) {
    const existing = await Organization.findOne({ where: { slug: body.slug } });
    if (existing) {
      return { slugConflict: true };
    }
  }

  await org.update(body);
  return { org };
};

exports.remove = async (id) => {
  const org = await Organization.findByPk(id);
  if (!org) return false;

  await Subscription.destroy({ where: { organizationId: org.id } });
  await org.destroy();
  return true;
};

exports.suspend = async (id) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  await org.update({ subscriptionStatus: 'suspended' });
  return org;
};

exports.reactivate = async (id) => {
  const org = await Organization.findByPk(id);
  if (!org) return null;

  await org.update({ subscriptionStatus: 'active' });
  return org;
};
