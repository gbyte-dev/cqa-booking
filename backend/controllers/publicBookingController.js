const publicBookingService = require('../services/publicBookingService');

exports.checkAvailability = async (req, res) => {
  const venue = await publicBookingService.findVenue(req.params.slug);
  if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });

  const result = await publicBookingService.checkAvailability(venue, req.body);

  if (result.error) {
    return res.status(result.status).json({ success: false, error: result.error });
  }

  res.json({ success: true, data: result.result });
};

exports.createBooking = async (req, res) => {
  const { customerName, bookingDate, bookingStartTime, bookingEndTime, numGuests } = req.body;

  if (!customerName || !bookingDate || !bookingStartTime || !bookingEndTime || !numGuests) {
    return res.status(400).json({ success: false, error: 'Guest and booking details are required' });
  }

  const venue = await publicBookingService.findVenue(req.params.slug);
  if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });

  try {
    const result = await publicBookingService.createBooking(venue, req.body);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.status(201).json({
      success: true,
      data: {
        bookingId: result.booking.id,
        bookingStatus: result.booking.bookingStatus,
        depositRequired: result.booking.depositRequired
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
