const { v4: uuidv4 } = require('uuid');
const Venue = require('../models/Venue');

exports.create = (organizationId, body) => {
  const {
    name,
    description,
    address,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    phone,
    email,
    website,
    logoUrl,
    coverImageUrl,
    venueType,
    openingTime,
    closingTime,
    capacity,
    currency,
    timezone
  } = body;

  return Venue.create({
    id: uuidv4(),
    organizationId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description,
    address,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    phone,
    email,
    website,
    logoUrl,
    coverImageUrl,
    venueType,
    openingTime,
    closingTime,
    capacity,
    currency: currency || 'INR',
    timezone: timezone || 'UTC',
    status: 'active'
  });
};

exports.listByOrganization = (organizationId) => {
  return Venue.findAll({
    where: { organizationId },
    order: [['created_at', 'DESC']],
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });
};

exports.getById = (id, organizationId) => {
  return Venue.findOne({
    where: { id, organizationId },
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });
};

const ALLOWED_UPDATE_FIELDS = [
  'name',
  'description',
  'address',
  'city',
  'state',
  'postalCode',
  'country',
  'latitude',
  'longitude',
  'phone',
  'email',
  'website',
  'logoUrl',
  'coverImageUrl',
  'venueType',
  'openingTime',
  'closingTime',
  'capacity',
  'currency',
  'timezone',
  'status'
];

exports.update = async (id, organizationId, body) => {
  const venue = await Venue.findOne({
    where: { id, organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!venue) {
    return null;
  }

  const updateData = {};
  ALLOWED_UPDATE_FIELDS.forEach(field => {
    if (field in body) {
      updateData[field] = body[field];
    }
  });

  await venue.update(updateData);
  return venue;
};

exports.remove = async (id, organizationId) => {
  const venue = await Venue.findOne({
    where: { id, organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!venue) {
    return false;
  }

  await venue.destroy();
  return true;
};
