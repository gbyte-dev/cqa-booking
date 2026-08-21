const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Table = require('../models/Table');

exports.getStats = async () => {
  const bookings = await Booking.findAll();

  return {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.bookingStatus === 'pending').length,
    completedBookings: bookings.filter(b => b.bookingStatus === 'completed').length,
    cancelledBookings: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    checkedInBookings: bookings.filter(b => b.bookingStatus === 'checked_in').length,
    noShowBookings: bookings.filter(b => b.bookingStatus === 'no_show' || b.noShow).length,
    totalGuests: bookings.reduce((sum, booking) => sum + Number(booking.numGuests || 0), 0),
    averageBookingValue: 0
  };
};

exports.listAll = () => {
  return Booking.findAll({
    include: [
      { model: Venue, as: 'Venue', attributes: ['id', 'name', 'city', 'address'], required: false },
      { model: Table, as: 'Table', attributes: ['id', 'name', 'capacity'], required: false }
    ],
    order: [['bookingDate', 'DESC']],
    limit: 500
  });
};

exports.getById = (id) => {
  return Booking.findByPk(id, {
    include: [
      { model: Venue, as: 'Venue', required: false },
      { model: Table, as: 'Table', required: false }
    ]
  });
};

exports.confirm = async (id) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;

  await booking.update({ bookingStatus: 'confirmed' });
  return booking;
};

exports.complete = async (id) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;

  await booking.update({ bookingStatus: 'completed', checkOutTime: new Date() });
  return booking;
};

exports.cancel = async (id, reason) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;

  await booking.update({
    bookingStatus: 'cancelled',
    cancellationReason: reason || null,
    cancellationDate: new Date()
  });
  return booking;
};
