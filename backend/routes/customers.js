const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const customerController = require('../controllers/customerController');

const router = express.Router();

// ===== SELF-SERVICE: authenticated CUSTOMER managing their OWN profile/avatar.
// Placed before the tenant-facing '/:id' routes below so 'me' is never read as an id.
// No requireVerifiedEmail here — customers are exempt (they get a warning banner instead).
router.get('/me', authMiddleware, customerController.getMe);
router.patch('/me', authMiddleware, customerController.updateMe);
router.post('/me/avatar', authMiddleware, customerController.uploadAvatar);
router.delete('/me/avatar', authMiddleware, customerController.removeAvatar);

// ===== TENANT-FACING customer management (owner/manager/staff) =====
router.use(requireVerifiedEmail);

router.get('/', authMiddleware, customerController.list);
router.get('/:id/loyalty', authMiddleware, customerController.getLoyalty);
router.get('/:id', authMiddleware, customerController.getOne);
router.get('/:id/bookings', authMiddleware, customerController.getBookings);
router.patch('/:id', authMiddleware, customerController.update);
router.post('/:id/suspend', authMiddleware, customerController.suspend);
router.post('/:id/activate', authMiddleware, customerController.activate);
router.delete('/:id', authMiddleware, customerController.remove);

module.exports = router;
