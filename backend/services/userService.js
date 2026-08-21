const User = require('../models/User');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

exports.listCustomers = () => {
  return User.findAll({
    where: { role: 'customer' },
    include: [
      {
        association: 'Organization',
        attributes: ['id', 'name', 'slug']
      }
    ],
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']]
  });
};

exports.getById = (id) => {
  return User.findByPk(id, {
    include: [
      {
        association: 'Organization',
        attributes: ['id', 'name', 'slug']
      }
    ],
    attributes: { exclude: ['passwordHash'] }
  });
};

exports.getBookingsForUser = async (userId) => {
  const bookings = await Booking.findAll({
    where: { userId },
    include: [
      {
        model: Venue,
        attributes: ['id', 'name', 'address', 'city']
      },
      {
        model: Table,
        attributes: ['id', 'name', 'capacity', 'tableType']
      }
    ],
    order: [['bookingDate', 'DESC']]
  });

  const stats = {
    totalBookings: bookings.length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalGuests: bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0)
  };

  return { bookings, stats };
};

const ALLOWED_UPDATE_FIELDS = ['firstName', 'lastName', 'emailVerified'];

exports.update = async (id, body) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  await user.update(updateData);
  return user;
};

exports.remove = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return false;

  await Booking.destroy({ where: { userId: user.id } });
  await user.destroy();
  return true;
};

exports.suspend = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  await user.update({ status: 'suspended' });
  return user;
};

exports.reactivate = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  await user.update({ status: 'active' });
  return user;
};
