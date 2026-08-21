const Reservation = require('../models/Reservation');
const Outlet = require('../models/Outlet');
const TableDaybed = require('../models/TableDaybed');
const GuestProfile = require('../models/GuestProfile');

const LIST_INCLUDE = [
  { model: Outlet, as: 'Outlet', attributes: ['id', 'name', 'address'], required: false },
  { model: TableDaybed, as: 'Table', attributes: ['id', 'tableNumber', 'maxCapacity'], required: false },
  { model: GuestProfile, as: 'GuestProfile', attributes: ['id', 'fullName', 'email', 'phone'], required: false }
];

exports.getStats = async () => {
  const bookings = await Reservation.findAll();

  return {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    checkedInBookings: bookings.filter(b => b.status === 'checked_in').length,
    noShowBookings: bookings.filter(b => b.status === 'no_show').length,
    totalGuests: bookings.reduce((sum, booking) => sum + Number(booking.guestCount || 0), 0),
    averageBookingValue: 0
  };
};

exports.listAll = () => {
  return Reservation.findAll({
    include: LIST_INCLUDE,
    order: [['reservation_date', 'DESC']],
    limit: 500
  });
};

exports.getById = (id) => {
  return Reservation.findByPk(id, {
    include: LIST_INCLUDE
  });
};

exports.confirm = async (id) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return null;

  await booking.update({ status: 'confirmed' });
  return booking;
};

exports.complete = async (id) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return null;

  await booking.update({ status: 'completed' });
  return booking;
};

exports.cancel = async (id, reason) => {
  const booking = await Reservation.findByPk(id);
  if (!booking) return null;

  await booking.update({
    status: 'cancelled',
    cancellationReason: reason || null
  });
  return booking;
};
