const GuestProfile = require('../models/GuestProfile');
const Reservation = require('../models/Reservation');
const Outlet = require('../models/Outlet');
const TableDaybed = require('../models/TableDaybed');

exports.listByOrganization = (organizationId) => {
  return GuestProfile.findAll({
    where: { tenantId: organizationId },
    order: [['created_at', 'DESC']],
    raw: false
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });
};

exports.getById = (id, organizationId) => {
  return GuestProfile.findOne({
    where: { id, tenantId: organizationId },
    raw: false
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });
};

exports.getBookings = async (id, organizationId) => {
  const guest = await GuestProfile.findOne({
    where: { id, tenantId: organizationId }
  });

  if (!guest) {
    return null;
  }

  const bookings = await Reservation.findAll({
    where: { guestProfileId: id },
    include: [
      { model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false },
      { model: TableDaybed, as: 'Table', attributes: ['id', 'tableNumber'], required: false }
    ],
    order: [['reservation_date', 'DESC']],
    raw: false
  }).catch(err => {
    console.error('Database error:', err);
    return [];
  });

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalGuests: bookings.reduce((sum, b) => sum + (Number(b.guestCount) || 0), 0)
  };

  return { bookings, stats };
};

exports.update = async (id, organizationId, updateData) => {
  const guest = await GuestProfile.findOne({
    where: { id, tenantId: organizationId }
  }).catch(err => {
    console.error('Database error:', err);
    return null;
  });

  if (!guest) {
    return null;
  }

  await guest.update(updateData);
  return guest;
};

exports.remove = async (id, organizationId) => {
  const guest = await GuestProfile.findOne({
    where: { id, tenantId: organizationId }
  });

  if (!guest) {
    return false;
  }

  await guest.destroy();
  return true;
};
