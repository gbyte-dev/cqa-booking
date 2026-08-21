const express = require('express');
const authMiddleware = require('../middleware/auth');
const customerController = require('../controllers/customerController');

const router = express.Router();

router.get('/', authMiddleware, customerController.list);
router.get('/:id/loyalty', authMiddleware, customerController.getLoyalty);
router.get('/:id', authMiddleware, customerController.getOne);
router.get('/:id/bookings', authMiddleware, customerController.getBookings);
router.patch('/:id', authMiddleware, customerController.update);
router.post('/:id/suspend', authMiddleware, customerController.suspend);
router.post('/:id/activate', authMiddleware, customerController.activate);
router.delete('/:id', authMiddleware, customerController.remove);

module.exports = router;
