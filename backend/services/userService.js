const { Op } = require('sequelize');
const User = require('../models/User');
const GuestProfile = require('../models/GuestProfile');
const Reservation = require('../models/Reservation');
const Outlet = require('../models/Outlet');
const TableDaybed = require('../models/TableDaybed');

exports.listCustomers = () => {
  return User.findAll({
    where: { roleCode: 'customer' },
    include: [
      {
        association: 'Tenant',
        attributes: ['id', 'name', 'slug']
      }
    ],
    attributes: { exclude: ['passwordHash'] },
    order: [['created_at', 'DESC']]
  });
};

exports.getById = (id) => {
  return User.findByPk(id, {
    include: [
      {
        association: 'Tenant',
        attributes: ['id', 'name', 'slug']
      }
    ],
    attributes: { exclude: ['passwordHash'] }
  });
};

exports.getBookingsForUser = async (userId) => {
  const guestProfiles = await GuestProfile.findAll({ where: { userId }, attributes: ['id'] });
  const guestProfileIds = guestProfiles.map(g => g.id);

  if (guestProfileIds.length === 0) {
    return { bookings: [], stats: { totalBookings: 0, cancelledBookings: 0, completedBookings: 0, totalGuests: 0 } };
  }

  const bookings = await Reservation.findAll({
    where: { guestProfileId: { [Op.in]: guestProfileIds } },
    include: [
      { model: Outlet, as: 'Outlet', attributes: ['id', 'name', 'address'] },
      { model: TableDaybed, as: 'Table', attributes: ['id', 'tableNumber', 'maxCapacity'] }
    ],
    order: [['reservation_date', 'DESC']]
  });

  const stats = {
    totalBookings: bookings.length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalGuests: bookings.reduce((sum, b) => sum + Number(b.guestCount || 0), 0)
  };

  return { bookings, stats };
};

const ALLOWED_UPDATE_FIELDS = ['fullName', 'email'];

exports.update = async (id, body) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  if (body.firstName !== undefined || body.lastName !== undefined) {
    const [currentFirst, ...currentRest] = (user.fullName || '').split(' ');
    const firstName = body.firstName !== undefined ? body.firstName : currentFirst;
    const lastName = body.lastName !== undefined ? body.lastName : currentRest.join(' ');
    updateData.fullName = `${firstName || ''} ${lastName || ''}`.trim();
  }

  await user.update(updateData);
  return exports.getById(id);
};

exports.remove = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return false;

  await user.destroy();
  return true;
};
