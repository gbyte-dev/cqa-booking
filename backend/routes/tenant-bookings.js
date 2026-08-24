const express = require('express');
const authMiddleware = require('../middleware/auth');
const bookingController = require('../controllers/tenantBookingController');

const router = express.Router();

router.post('/availability', authMiddleware, bookingController.checkAvailability);
router.post('/', authMiddleware, bookingController.create);

// MUST BE FIRST — before /:id
router.get('/stats', authMiddleware, bookingController.getStats);

router.get('/', authMiddleware, bookingController.list);
router.get('/:id', authMiddleware, bookingController.getOne);
router.get('/:id/activity', authMiddleware, bookingController.getActivity);
router.post('/:id/confirm', authMiddleware, bookingController.confirm);
router.post('/:id/complete', authMiddleware, bookingController.complete);
router.post('/:id/check-in', authMiddleware, bookingController.checkIn);
router.post('/:id/no-show', authMiddleware, bookingController.markNoShow);
router.post('/:id/cancel', authMiddleware, bookingController.cancel);

module.exports = router;
