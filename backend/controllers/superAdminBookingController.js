const bookingService = require('../services/superAdminBookingService');

const toApiShape = (reservation) => {
  if (!reservation) return null;
  const plain = reservation.toJSON ? reservation.toJSON() : reservation;
  return {
    ...plain,
    venueId: plain.outletId,
    tableId: plain.tableId,
    customerId: plain.guestProfileId,
    customerName: plain.GuestProfile?.fullName || '',
    customerEmail: plain.GuestProfile?.email || null,
    customerPhone: plain.GuestProfile?.phone || null,
    bookingDate: plain.reservationDate,
    bookingStartTime: plain.startTime,
    bookingEndTime: plain.endTime,
    numGuests: plain.guestCount,
    bookingStatus: plain.status,
    notes: plain.specialRequests,
    Venue: plain.Outlet ? { id: plain.Outlet.id, name: plain.Outlet.name, city: '', address: plain.Outlet.address } : null,
    Table: plain.Table ? { id: plain.Table.id, name: plain.Table.tableNumber, capacity: plain.Table.maxCapacity } : null
  };
};

exports.getStats = async (req, res) => {
  try {
    console.log('📊 [SUPERADMIN /bookings/stats] Calculating stats');

    const stats = await bookingService.getStats();

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Superadmin booking stats error:', error);
    res.status(200).json({
      success: true,
      data: {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        checkedInBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0
      }
    });
  }
};

exports.list = async (req, res) => {
  try {
    console.log('📋 [SUPERADMIN /bookings] Fetching all bookings');

    const bookings = await bookingService.listAll();
    const data = bookings.map(toApiShape);

    console.log(`✅ Found ${data.length} total bookings`);

    res.json({ success: true, data: data || [], count: data.length });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(200).json({ success: true, data: [], count: 0 });
  }
};

exports.getOne = async (req, res) => {
  try {
    const booking = await bookingService.getById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: toApiShape(booking) });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const booking = await bookingService.confirm(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking confirmed', data: toApiShape(booking) });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const booking = await bookingService.complete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking completed', data: toApiShape(booking) });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const booking = await bookingService.cancel(req.params.id, req.body.reason);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking cancelled', data: toApiShape(booking) });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
