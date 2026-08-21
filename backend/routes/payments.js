const express = require('express');
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();
router.use(authMiddleware);

router.post('/booking/:bookingId', paymentController.create);
router.get('/booking/:bookingId', paymentController.listByBooking);
router.post('/:id/complete', paymentController.complete);
router.post('/:id/refund', paymentController.refund);

module.exports = router;
