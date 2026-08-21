const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const Venue = require('../models/Venue');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const { sequelize } = require('../config/database');
const { isWithinOperatingHours } = require('../utils/booking-rules');
const { queueNotification } = require('../utils/notifications');

exports.findVenue = (slug) => {
  return Venue.findOne({ where: { slug, status: 'active' } });
};

exports.checkAvailability = async (venue, { bookingDate, bookingStartTime, bookingEndTime, numGuests }) => {
  if (!isWithinOperatingHours(bookingStartTime, bookingEndTime, venue.openingTime, venue.closingTime)) {
    return { error: 'Booking is outside operating hours', status: 400 };
  }

  const tables = await Table.findAll({ where: { venueId: venue.id, capacity: { [Op.gte]: numGuests }, status: 'active' } });
  const available = [];

  for (const table of tables) {
    const conflict = await Booking.findOne({
      where: {
        tableId: table.id,
        bookingDate: new Date(bookingDate),
        bookingStatus: { [Op.notIn]: ['cancelled', 'no_show'] },
        bookingStartTime: { [Op.lt]: bookingEndTime },
        bookingEndTime: { [Op.gt]: bookingStartTime }
      }
    });
    if (!conflict) available.push({ id: table.id, name: table.name, capacity: table.capacity });
  }

  return {
    result: {
      venue: { id: venue.id, name: venue.name, slug: venue.slug },
      available
    }
  };
};

exports.createBooking = async (venue, body) => {
  const { tableId, customerName, customerEmail, customerPhone, bookingDate, bookingStartTime, bookingEndTime, numGuests, totalAmount, notes } = body;

  if (!isWithinOperatingHours(bookingStartTime, bookingEndTime, venue.openingTime, venue.closingTime)) {
    return { error: 'Booking is outside operating hours', status: 400 };
  }

  const transaction = await sequelize.transaction();
  try {
    if (tableId) {
      const table = await Table.findOne({
        where: { id: tableId, venueId: venue.id, status: 'active' },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!table) {
        await transaction.rollback();
        return { error: 'Table not available', status: 404 };
      }

      const conflict = await Booking.findOne({
        where: {
          tableId,
          bookingDate: new Date(bookingDate),
          bookingStatus: { [Op.notIn]: ['cancelled', 'no_show'] },
          bookingStartTime: { [Op.lt]: bookingEndTime },
          bookingEndTime: { [Op.gt]: bookingStartTime }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (conflict) {
        await transaction.rollback();
        return { error: 'Selected resource is no longer available', status: 409 };
      }
    }

    const [firstName, ...lastNameParts] = customerName.trim().split(/\s+/);
    const customer = await Customer.create({
      id: uuidv4(),
      organizationId: venue.organizationId,
      firstName,
      lastName: lastNameParts.join(' ') || null,
      email: customerEmail || null,
      phone: customerPhone || null
    }, { transaction });

    const booking = await Booking.create({
      id: uuidv4(),
      organizationId: venue.organizationId,
      venueId: venue.id,
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
      depositRequired: Number(totalAmount || 0) * Number(venue.depositPercent || 0) / 100,
      notes: notes || null,
      bookingStatus: 'pending',
      source: 'public'
    }, { transaction });

    await transaction.commit();

    if (customerEmail || customerPhone) {
      await queueNotification({
        organizationId: venue.organizationId,
        bookingId: booking.id,
        customerId: customer.id,
        channel: customerEmail ? 'email' : 'sms',
        event: 'booking_created',
        recipient: customerEmail || customerPhone,
        payload: { bookingId: booking.id }
      });
    }

    return { booking };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
