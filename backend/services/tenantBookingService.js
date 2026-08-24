const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Reservation = require('../models/Reservation');
const TableDaybed = require('../models/TableDaybed');
const Outlet = require('../models/Outlet');
const GuestProfile = require('../models/GuestProfile');
const { writeAudit } = require('../utils/audit');
const { queueNotification } = require('../utils/notifications');

exports.findVenueForOrg = (venueId, organizationId, role, outletId) => {
  if (['manager','staff'].includes(role) && outletId && venueId !== outletId) {
    return Promise.resolve(null);
  }
  return Outlet.findOne({
    where: { id: venueId, tenantId: organizationId }
  });
};

// NOTE: operating-hours validation was dropped along with `outlets.opening_time`/`closing_time`
// in the new schema (user decision 2026-08-21) — availability now only checks table conflicts.
exports.findAvailableTables = async ({ venueId, bookingDate, bookingStartTime, bookingEndTime, numGuests }) => {
  const tables = await TableDaybed.findAll({
    where: {
      outletId: venueId,
      maxCapacity: { [Op.gte]: numGuests },
      isActive: true
    }
  });

  if (tables.length === 0) {
    return [];
  }

  const availableTables = [];

  for (const table of tables) {
    const conflict = await Reservation.findOne({
      where: {
        tableId: table.id,
        reservationDate: new Date(bookingDate),
        status: { [Op.ne]: 'cancelled' },
        startTime: { [Op.lt]: bookingEndTime },
        endTime: { [Op.gt]: bookingStartTime }
      }
    });

    if (!conflict) {
      availableTables.push({
        id: table.id,
        name: table.tableNumber,
        capacity: table.maxCapacity
      });
    }
  }

  return availableTables;
};

exports.createBooking = async (req) => {
  const {
    venueId,
    tableId,
    customerName,
    customerEmail,
    customerPhone,
    totalAmount,
    notes,
    bookingDate,
    bookingStartTime,
    bookingEndTime,
    numGuests
  } = req.body;

  const venue = await exports.findVenueForOrg(venueId, req.user.organizationId, req.user.role, req.user.outletId);
  if (!venue) {
    return { error: 'Venue not found', status: 404 };
  }

  const transaction = await sequelize.transaction();

  let guest = null;
  let reservation = null;

  try {
    if (customerEmail || customerPhone) {
      guest = await GuestProfile.findOne({
        where: {
          tenantId: req.user.organizationId,
          ...(customerEmail ? { email: customerEmail } : { phone: customerPhone })
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
    }
    if (!guest) {
      guest = await GuestProfile.create({
        id: uuidv4(),
        tenantId: req.user.organizationId,
        fullName: customerName,
        email: customerEmail || null,
        phone: customerPhone || null
      }, { transaction });
    }

    if (tableId) {
      const table = await TableDaybed.findOne({
        where: { id: tableId, outletId: venueId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!table) {
        await transaction.rollback();
        return { error: 'Table not found', status: 404 };
      }

      const conflict = await Reservation.findOne({
        where: {
          tableId,
          reservationDate: new Date(bookingDate),
          status: { [Op.ne]: 'cancelled' },
          startTime: { [Op.lt]: bookingEndTime },
          endTime: { [Op.gt]: bookingStartTime }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (conflict) {
        await transaction.rollback();
        return { error: 'Table already booked for this date', status: 400 };
      }
    }

    reservation = await Reservation.create({
      id: uuidv4(),
      reservationCode: uuidv4().slice(0, 8).toUpperCase(),
      outletId: venueId,
      tableId: tableId || null,
      guestProfileId: guest.id,
      guestCount: numGuests,
      reservationDate: new Date(bookingDate),
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      status: 'pending',
      specialRequests: notes || null,
      depositAmount: 0,
      isDepositPaid: false
    }, { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  try {
    await guest.increment('totalVisitsCount');
    await writeAudit({ req, action: 'booking.created', entityType: 'reservation', entityId: reservation.id });
    if (customerEmail || customerPhone) {
      await queueNotification({ organizationId: req.user.organizationId, bookingId: reservation.id, customerId: guest.id, channel: customerEmail ? 'email' : 'sms', event: 'booking_created', recipient: customerEmail || customerPhone, payload: { bookingId: reservation.id, bookingDate, bookingStartTime, bookingEndTime } });
    }
  } catch (error) {
    console.error('Post-booking side-effect error (booking already saved):', error.message);
  }

  return { booking: reservation, guest, totalAmount };
};

exports.getStats = async (organizationId, role, outletId) => {
  const outletIds = ['manager','staff'].includes(role) && outletId
    ? [outletId]
    : (await Outlet.findAll({ where: { tenantId: organizationId }, attributes: ['id'] })).map(o => o.id);
  const bookings = await Reservation.findAll({ where: { outletId: { [Op.in]: outletIds } } });

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

const LIST_INCLUDE = [
  { model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false },
  { model: TableDaybed, as: 'Table', attributes: ['id', 'tableNumber', 'maxCapacity'], required: false },
  { model: GuestProfile, as: 'GuestProfile', attributes: ['id', 'fullName', 'email', 'phone'], required: false }
];

exports.listByOrganization = async (organizationId, role, outletId) => {
  const outletIds = ['manager','staff'].includes(role) && outletId
    ? [outletId]
    : (await Outlet.findAll({ where: { tenantId: organizationId }, attributes: ['id'] })).map(o => o.id);
  return Reservation.findAll({
    where: { outletId: { [Op.in]: outletIds } },
    include: LIST_INCLUDE,
    order: [['reservation_date', 'DESC']],
    limit: 500
  });
};

exports.getById = async (id, organizationId, role, outletId) => {
  const reservation = await Reservation.findByPk(id, { include: LIST_INCLUDE });
  if (!reservation) return null;
  if (['manager','staff'].includes(role) && outletId && reservation.outletId !== outletId) return null;
  const outlet = await Outlet.findOne({ where: { id: reservation.outletId, tenantId: organizationId } });
  if (!outlet) return null;
  return reservation;
};

exports.findForOrg = async (id, organizationId, role, outletId) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) return null;
  if (['manager','staff'].includes(role) && outletId && reservation.outletId !== outletId) return null;
  const outlet = await Outlet.findOne({ where: { id: reservation.outletId, tenantId: organizationId } });
  if (!outlet) return null;
  return reservation;
};

exports.confirm = async (booking, req) => {
  await booking.update({ status: 'confirmed' });
  await writeAudit({ req, action: 'booking.confirmed', entityType: 'reservation', entityId: booking.id });
  return { booking };
};

exports.complete = async (booking, req) => {
  await booking.update({ status: 'completed' });
  if (booking.guestProfileId) {
    const guest = await GuestProfile.findByPk(booking.guestProfileId);
    if (guest) await guest.increment('totalVisitsCount');
  }
  await writeAudit({ req, action: 'booking.completed', entityType: 'reservation', entityId: booking.id });
  return { booking };
};

exports.checkIn = async (booking, req) => {
  if (!['confirmed', 'pending'].includes(booking.status)) {
    return { error: 'Booking cannot be checked in', status: 400 };
  }
  await booking.update({ status: 'checked_in' });
  await writeAudit({ req, action: 'booking.checked_in', entityType: 'reservation', entityId: booking.id });
  return { booking };
};

exports.markNoShow = async (booking, req) => {
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return { error: 'Booking cannot be marked as no-show', status: 400 };
  }
  await booking.update({ status: 'no_show' });
  await writeAudit({ req, action: 'booking.no_show', entityType: 'reservation', entityId: booking.id });
  return { booking };
};

exports.cancel = async (booking, req, reason) => {
  await booking.update({
    status: 'cancelled',
    cancellationReason: reason || null
  });
  await writeAudit({ req, action: 'booking.cancelled', entityType: 'reservation', entityId: booking.id, metadata: { reason } });
  return booking;
};

exports.getActivity = async (bookingId, organizationId) => {
  const AuditLog = require('../models/AuditLog');
  const User = require('../models/User');
  return AuditLog.findAll({
    where: { entityType: 'reservation', entityId: bookingId, tenantId: organizationId },
    include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'roleCode'], required: false }],
    order: [['created_at', 'ASC']]
  });
};
