const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

exports.listByOrganization = (organizationId) => {
  return Customer.findAll({
    where: { organizationId },
    order: [['created_at', 'DESC']],
    raw: false,
    attributes: [
      'id',
      'firstName',
      'lastName',
      'email',
      'phone',
      'customerType',
      'totalBookings',
      'totalSpent',
      'averageSpending',
      'lastBookingDate',
      'preferredContactMethod',
      'marketingConsent',
      'status',
      'isVip',
      'tags',
      'created_at',
      'updated_at'
    ]
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });
};

exports.getLoyalty = (id, organizationId) => {
  return Customer.findOne({
    where: { id, organizationId },
    attributes: ['id', 'totalBookings', 'loyaltyPoints', 'customerType']
  });
};

exports.getById = (id, organizationId) => {
  return Customer.findOne({
    where: { id, organizationId },
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });
};

exports.getBookings = async (id, organizationId) => {
  const customer = await Customer.findOne({
    where: { id, organizationId }
  });

  if (!customer) {
    return null;
  }

  const bookings = await Booking.findAll({
    where: {
      customerId: id,
      organizationId
    },
    include: [
      {
        model: Venue,
        as: 'Venue',
        attributes: ['id', 'name'],
        required: false
      },
      {
        model: Table,
        as: 'Table',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    order: [['booking_date', 'DESC']],
    raw: false,
    subQuery: false
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    completedBookings: bookings.filter(b => b.bookingStatus === 'completed').length,
    cancelledBookings: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    totalGuests: bookings.reduce((sum, b) => sum + (Number(b.numGuests) || 0), 0)
  };

  return { bookings, stats };
};

const ALLOWED_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'customerType',
  'preferredContactMethod',
  'marketingConsent',
  'notes',
  'isVip',
  'tags',
  'anniversaryDate'
];

exports.update = async (id, organizationId, body) => {
  const customer = await Customer.findOne({
    where: { id, organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!customer) {
    return null;
  }

  const updateData = {};
  ALLOWED_UPDATE_FIELDS.forEach(field => {
    if (field in body) {
      updateData[field] = body[field];
    }
  });

  await customer.update(updateData);
  return customer;
};

exports.suspend = async (id, organizationId, reason) => {
  const customer = await Customer.findOne({
    where: { id, organizationId }
  });

  if (!customer) {
    return null;
  }

  const suspensionNote = reason || 'Customer suspended';
  const updatedNotes = `[suspend reason] ${suspensionNote}\n${customer.notes || ''}`;

  await customer.update({
    status: 'suspended',
    notes: updatedNotes
  });

  return customer;
};

exports.activate = async (id, organizationId) => {
  const customer = await Customer.findOne({
    where: { id, organizationId }
  });

  if (!customer) {
    return null;
  }

  await customer.update({ status: 'active' });
  return customer;
};

exports.remove = async (id, organizationId) => {
  const customer = await Customer.findOne({
    where: { id, organizationId }
  });

  if (!customer) {
    return false;
  }

  await customer.destroy();
  return true;
};
