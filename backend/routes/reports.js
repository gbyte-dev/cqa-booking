const express = require('express');
const authMiddleware = require('../middleware/auth');
const reportController = require('../controllers/reportController');

const router = express.Router();
router.use(authMiddleware);

router.get('/bookings.csv', reportController.bookingsCsv);
router.get('/customers.csv', reportController.customersCsv);
router.get('/payments.csv', reportController.paymentsCsv);

module.exports = router;
