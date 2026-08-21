const bookingService = require('../services/tenantBookingService');

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
    totalAmount: plain.depositAmount || 0,
    notes: plain.specialRequests,
    Venue: plain.Outlet ? { id: plain.Outlet.id, name: plain.Outlet.name, city: '', address: '' } : null,
    Table: plain.Table ? { id: plain.Table.id, name: plain.Table.tableNumber, capacity: plain.Table.maxCapacity } : null
  };
};

// ===== CHECK AVAILABILITY =====
exports.checkAvailability = async (req, res) => {
  try {
    const { venueId, bookingDate, bookingStartTime, bookingEndTime, numGuests } = req.body;

    if (!venueId || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const venue = await bookingService.findVenueForOrg(venueId, req.user.organizationId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    const availableTables = await bookingService.findAvailableTables({ venueId, bookingDate, bookingStartTime, bookingEndTime, numGuests });

    if (availableTables.length === 0) {
      return res.json({
        success: true,
        available: [],
        message: 'No tables available for this guest count'
      });
    }

    res.json({
      success: true,
      available: availableTables
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== CREATE BOOKING (TENANT) =====
exports.create = async (req, res) => {
  try {
    const { venueId, customerName, bookingDate, bookingStartTime, bookingEndTime, numGuests } = req.body;

    if (!venueId || !customerName || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await bookingService.createBooking(req);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        error: result.error
      });
    }

    const shaped = toApiShape(result.booking);
    shaped.customerName = req.body.customerName;
    shaped.customerEmail = req.body.customerEmail;
    shaped.customerPhone = req.body.customerPhone;
    shaped.totalAmount = Number(req.body.totalAmount || 0);
    shaped.depositRequired = 0;

    res.status(201).json({
      success: true,
      data: shaped,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET BOOKING STATS (MUST BE FIRST!) =====
exports.getStats = async (req, res) => {
  try {
    console.log('📊 [TENANT /bookings/stats] Calculating stats');

    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const stats = await bookingService.getStats(organizationId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Tenant booking stats error:', error);
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

// ===== GET ALL BOOKINGS (TENANT - ONLY THEIR ORG) =====
exports.list = async (req, res) => {
  try {
    console.log('📋 [TENANT /bookings] Fetching bookings');

    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const bookings = await bookingService.listByOrganization(organizationId);
    const data = bookings.map(toApiShape);

    console.log(`✅ Found ${data.length} bookings for org: ${organizationId}`);

    res.json({
      success: true,
      data: data || [],
      count: data.length
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  }
};

// ===== GET SINGLE BOOKING (TENANT - CHECK ORG) =====
exports.getOne = async (req, res) => {
  try {
    const booking = await bookingService.getById(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: toApiShape(booking)
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== CONFIRM BOOKING (TENANT) =====
exports.confirm = async (req, res) => {
  try {
    const booking = await bookingService.findForOrg(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const result = await bookingService.confirm(booking, req);

    res.json({
      success: true,
      message: 'Booking confirmed',
      data: toApiShape(result.booking)
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== COMPLETE BOOKING (TENANT) =====
exports.complete = async (req, res) => {
  try {
    const booking = await bookingService.findForOrg(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const result = await bookingService.complete(booking);

    res.json({
      success: true,
      message: 'Booking completed',
      data: toApiShape(result.booking)
    });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== CHECK IN BOOKING (TENANT) =====
exports.checkIn = async (req, res) => {
  try {
    const booking = await bookingService.findForOrg(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const result = await bookingService.checkIn(booking, req);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Booking checked in', data: toApiShape(result.booking) });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK NO-SHOW (TENANT) =====
exports.markNoShow = async (req, res) => {
  try {
    const booking = await bookingService.findForOrg(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const result = await bookingService.markNoShow(booking, req);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Booking marked as no-show', data: toApiShape(result.booking) });
  } catch (error) {
    console.error('No-show error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== CANCEL BOOKING (TENANT) =====
exports.cancel = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await bookingService.findForOrg(req.params.id, req.user.organizationId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const updated = await bookingService.cancel(booking, req, reason);

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: toApiShape(updated)
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
