const express = require('express');
const publicBookingController = require('../controllers/publicBookingController');

const router = express.Router();

router.post('/:slug/availability', publicBookingController.checkAvailability);
router.post('/:slug/bookings', publicBookingController.createBooking);

module.exports = router;
