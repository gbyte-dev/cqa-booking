const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Venue = require('../models/Venue');
const Customer = require('../models/Customer');
const { isWithinOperatingHours } = require('../utils/booking-rules');
const { writeAudit } = require('../utils/audit');
const { queueNotification } = require('../utils/notifications');

exports.findVenueForOrg = (venueId, organizationId) => {
  return Venue.findOne({
    where: { id: venueId, organizationId }
  });
};

exports.isVenueOpenForBooking = (venue, bookingStartTime, bookingEndTime) => {
  return venue.status === 'active' && isWithinOperatingHours(
    bookingStartTime,
    bookingEndTime,
    venue.openingTime,
    venue.closingTime
  );
};

exports.findAvailableTables = async ({ venueId, bookingDate, bookingStartTime, bookingEndTime, numGuests }) => {
  const tables = await Table.findAll({
    where: {
      venueId,
      capacity: { [Op.gte]: numGuests },
      status: 'active'
    }
  });

  if (tables.length === 0) {
    return [];
  }

  const availableTables = [];

  for (const table of tables) {
    const conflict = await Booking.findOne({
      where: {
        tableId: table.id,
        bookingDate: new Date(bookingDate),
        bookingStatus: { [Op.ne]: 'cancelled' },
        bookingStartTime: { [Op.lt]: bookingEndTime },
        bookingEndTime: { [Op.gt]: bookingStartTime }
      }
    });

    if (!conflict) {
      availableTables.push({
        id: table.id,
        name: table.name,
        capacity: table.capacity
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

  const venue = await exports.findVenueForOrg(venueId, req.user.organizationId);
  if (!venue) {
    return { error: 'Venue not found', status: 404 };
  }

  if (!exports.isVenueOpenForBooking(venue, bookingStartTime, bookingEndTime)) {
    return { error: 'Venue is closed or booking is outside operating hours', status: 400 };
  }

  const transaction = await sequelize.transaction();

  try {
    let customer = null;
    if (customerEmail || customerPhone) {
      customer = await Customer.findOne({
        where: {
          organizationId: req.user.organizationId,
          ...(customerEmail ? { email: customerEmail } : { phone: customerPhone })
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
    }
    if (!customer) {
      const [firstName, ...lastNameParts] = customerName.trim().split(/\s+/);
      customer = await Customer.create({
        id: uuidv4(),
        organizationId: req.user.organizationId,
        firstName,
        lastName: lastNameParts.join(' ') || null,
        email: customerEmail || null,
        phone: customerPhone || null
      }, { transaction });
    }

    if (tableId) {
      const table = await Table.findOne({
        where: { id: tableId, venueId },
        include: [{
          model: Venue,
          as: 'Venue',
          where: { organizationId: req.user.organizationId },
          attributes: ['id']
        }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!table) {
        await transaction.rollback();
        return { error: 'Table not found', status: 404 };
      }

      const conflict = await Booking.findOne({
        where: {
          tableId,
          bookingDate: new Date(bookingDate),
          bookingStatus: { [Op.ne]: 'cancelled' },
          bookingStartTime: { [Op.lt]: bookingEndTime },
          bookingEndTime: { [Op.gt]: bookingStartTime }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (conflict) {
        await transaction.rollback();
        return { error: 'Table already booked for this date', status: 400 };
      }
    }

    const booking = await Booking.create({
      id: uuidv4(),
      organizationId: req.user.organizationId,
      venueId,
      tableId: tableId || null,
      customerId: customer.id,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: new Date(bookingDate),
      bookingStartTime,
      bookingEndTime,
      numGuests,
      totalAmount: Number(totalAmount || 0),
      depositRequired: Number(venue.depositPercent || 0) > 0 ? Number(totalAmount || 0) * Number(venue.depositPercent) / 100 : 0,
      notes: notes || null,
      bookingStatus: 'pending'
    }, { transaction });

    await transaction.commit();
    await customer.increment('totalBookings');
    await writeAudit({ req, action: 'booking.created', entityType: 'booking', entityId: booking.id });
    if (customerEmail || customerPhone) {
      await queueNotification({ organizationId: req.user.organizationId, bookingId: booking.id, customerId: customer.id, channel: customerEmail ? 'email' : 'sms', event: 'booking_created', recipient: customerEmail || customerPhone, payload: { bookingId: booking.id, bookingDate, bookingStartTime, bookingEndTime } });
    }

    return { booking };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getStats = async (organizationId) => {
  const bookings = await Booking.findAll({
    where: { organizationId }
  });

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

const LIST_INCLUDE = [
  {
    model: Venue,
    as: 'Venue',
    attributes: ['id', 'name', 'city', 'address'],
    required: false
  },
  {
    model: Table,
    as: 'Table',
    attributes: ['id', 'name', 'capacity'],
    required: false
  }
];

exports.listByOrganization = (organizationId) => {
  return Booking.findAll({
    where: { organizationId },
    include: LIST_INCLUDE,
    order: [['bookingDate', 'DESC']],
    limit: 500
  });
};

exports.getById = (id, organizationId) => {
  return Booking.findOne({
    where: { id, organizationId },
    include: LIST_INCLUDE
  });
};

exports.findForOrg = (id, organizationId) => {
  return Booking.findOne({
    where: { id, organizationId }
  });
};

exports.confirm = async (booking, req) => {
  if (Number(booking.depositRequired || 0) > Number(booking.depositPaid || 0)) {
    return { error: 'Required deposit must be paid before confirmation', status: 400 };
  }

  await booking.update({ bookingStatus: 'confirmed' });
  await writeAudit({ req, action: 'booking.confirmed', entityType: 'booking', entityId: booking.id });

  return { booking };
};

exports.complete = async (booking, req) => {
  await booking.update({
    bookingStatus: 'completed',
    checkOutTime: new Date()
  });
  if (booking.customerId) {
    await Customer.increment({ loyaltyPoints: 10 }, { where: { id: booking.customerId, organizationId: req.user.organizationId } });
  }

  return { booking };
};

exports.checkIn = async (booking, req) => {
  if (!['confirmed', 'pending'].includes(booking.bookingStatus)) {
    return { error: 'Booking cannot be checked in', status: 400 };
  }

  await booking.update({ bookingStatus: 'checked_in', checkInTime: new Date() });
  await writeAudit({ req, action: 'booking.checked_in', entityType: 'booking', entityId: booking.id });

  return { booking };
};

exports.markNoShow = async (booking, req) => {
  if (!['pending', 'confirmed'].includes(booking.bookingStatus)) {
    return { error: 'Booking cannot be marked as no-show', status: 400 };
  }

  await booking.update({ bookingStatus: 'no_show', noShow: true });
  await writeAudit({ req, action: 'booking.no_show', entityType: 'booking', entityId: booking.id });

  return { booking };
};

exports.cancel = async (booking, req, reason) => {
  const venue = await Venue.findOne({
    where: { id: booking.venueId, organizationId: req.user.organizationId }
  });
  const withinRefundWindow = new Date(booking.bookingDate).getTime() - Date.now() >= Number(venue?.cancellationWindowHours || 24) * 60 * 60 * 1000;

  await booking.update({
    bookingStatus: 'cancelled',
    cancellationReason: reason || null,
    cancellationDate: new Date(),
    cancellationBy: req.user.role,
    cancellationRefundAmount: withinRefundWindow
      ? Number(booking.depositPaid || 0) * Number(venue?.cancellationRefundPercent ?? 100) / 100
      : 0
  });

  await writeAudit({ req, action: 'booking.cancelled', entityType: 'booking', entityId: booking.id, metadata: { reason } });
  if (booking.customerEmail || booking.customerPhone) {
    await queueNotification({ organizationId: req.user.organizationId, bookingId: booking.id, customerId: booking.customerId, channel: booking.customerEmail ? 'email' : 'sms', event: 'booking_cancelled', recipient: booking.customerEmail || booking.customerPhone, payload: { refundAmount: booking.cancellationRefundAmount } });
  }

  return booking;
};
