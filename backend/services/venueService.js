const { v4: uuidv4 } = require('uuid');
const Outlet = require('../models/Outlet');

exports.create = (organizationId, body) => {
  const { name, description, address, city, phone, email, venueType, currency, timezone } = body;

  return Outlet.create({
    id: uuidv4(),
    tenantId: organizationId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    venueType,
    currency: currency || 'INR',
    timezone: timezone || 'UTC',
    contactEmail: email,
    contactPhone: phone,
    address: [address, city].filter(Boolean).join(', '),
    settings: description ? { description } : null
  });
};

exports.listByOrganization = (organizationId) => {
  return Outlet.findAll({
    where: { tenantId: organizationId },
    order: [['created_at', 'DESC']],
    raw: false
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });
};

exports.getById = (id, organizationId) => {
  return Outlet.findOne({
    where: { id, tenantId: organizationId },
    raw: false
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });
};

const ALLOWED_UPDATE_FIELDS_MAP = {
  name: 'name',
  venueType: 'venueType',
  currency: 'currency',
  timezone: 'timezone',
  email: 'contactEmail',
  phone: 'contactPhone',
  address: 'address',
  logoUrl: 'logoUrl'
};

exports.update = async (id, organizationId, body) => {
  const outlet = await Outlet.findOne({
    where: { id, tenantId: organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!outlet) {
    return null;
  }

  const updateData = {};
  Object.keys(ALLOWED_UPDATE_FIELDS_MAP).forEach(bodyField => {
    if (bodyField in body) {
      updateData[ALLOWED_UPDATE_FIELDS_MAP[bodyField]] = body[bodyField];
    }
  });

  await outlet.update(updateData);
  return outlet;
};

exports.remove = async (id, organizationId) => {
  const outlet = await Outlet.findOne({
    where: { id, tenantId: organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!outlet) {
    return false;
  }

  await outlet.destroy();
  return true;
};
