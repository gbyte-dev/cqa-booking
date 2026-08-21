const express = require('express');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const Venue = require('../models/Venue');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const { sequelize } = require('../config/database');
const { isWithinOperatingHours } = require('../utils/booking-rules');
const { queueNotification } = require('../utils/notifications');

const router = express.Router();

async function findVenue(slug) {
  return Venue.findOne({ where: { slug, status: 'active' } });
}

router.post('/:slug/availability', async (req, res) => {
  const { bookingDate, bookingStartTime, bookingEndTime, numGuests } = req.body;
  const venue = await findVenue(req.params.slug);
  if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
  if (!isWithinOperatingHours(bookingStartTime, bookingEndTime, venue.openingTime, venue.closingTime)) return res.status(400).json({ success: false, error: 'Booking is outside operating hours' });
  const tables = await Table.findAll({ where: { venueId: venue.id, capacity: { [Op.gte]: numGuests }, status: 'active' } });
  const available = [];
  for (const table of tables) {
    const conflict = await Booking.findOne({ where: { tableId: table.id, bookingDate: new Date(bookingDate), bookingStatus: { [Op.notIn]: ['cancelled', 'no_show'] }, bookingStartTime: { [Op.lt]: bookingEndTime }, bookingEndTime: { [Op.gt]: bookingStartTime } } });
    if (!conflict) available.push({ id: table.id, name: table.name, capacity: table.capacity });
  }
  res.json({ success: true, data: { venue: { id: venue.id, name: venue.name, slug: venue.slug }, available } });
});

router.post('/:slug/bookings', async (req, res) => {
  const { tableId, customerName, customerEmail, customerPhone, bookingDate, bookingStartTime, bookingEndTime, numGuests, totalAmount, notes } = req.body;
  if (!customerName || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) return res.status(400).json({ success: false, error: 'Guest and booking details are required' });
  const venue = await findVenue(req.params.slug);
  if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
  if (!isWithinOperatingHours(bookingStartTime, bookingEndTime, venue.openingTime, venue.closingTime)) return res.status(400).json({ success: false, error: 'Booking is outside operating hours' });
  const transaction = await sequelize.transaction();
  try {
    if (tableId) {
      const table = await Table.findOne({ where: { id: tableId, venueId: venue.id, status: 'active' }, transaction, lock: transaction.LOCK.UPDATE });
      if (!table) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'Table not available' });
      }
      const conflict = await Booking.findOne({ where: { tableId, bookingDate: new Date(bookingDate), bookingStatus: { [Op.notIn]: ['cancelled', 'no_show'] }, bookingStartTime: { [Op.lt]: bookingEndTime }, bookingEndTime: { [Op.gt]: bookingStartTime } }, transaction, lock: transaction.LOCK.UPDATE });
      if (conflict) {
        await transaction.rollback();
        return res.status(409).json({ success: false, error: 'Selected resource is no longer available' });
      }
    }
    const [firstName, ...lastNameParts] = customerName.trim().split(/\s+/);
    const customer = await Customer.create({ id: uuidv4(), organizationId: venue.organizationId, firstName, lastName: lastNameParts.join(' ') || null, email: customerEmail || null, phone: customerPhone || null }, { transaction });
    const booking = await Booking.create({ id: uuidv4(), organizationId: venue.organizationId, venueId: venue.id, tableId: tableId || null, customerId: customer.id, customerName, customerEmail, customerPhone, bookingDate: new Date(bookingDate), bookingStartTime, bookingEndTime, numGuests, totalAmount: Number(totalAmount || 0), depositRequired: Number(totalAmount || 0) * Number(venue.depositPercent || 0) / 100, notes: notes || null, bookingStatus: 'pending', source: 'public' }, { transaction });
    await transaction.commit();
    if (customerEmail || customerPhone) await queueNotification({ organizationId: venue.organizationId, bookingId: booking.id, customerId: customer.id, channel: customerEmail ? 'email' : 'sms', event: 'booking_created', recipient: customerEmail || customerPhone, payload: { bookingId: booking.id } });
    res.status(201).json({ success: true, data: { bookingId: booking.id, bookingStatus: booking.bookingStatus, depositRequired: booking.depositRequired } });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
