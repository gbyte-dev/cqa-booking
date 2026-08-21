const express = require('express');
const authMiddleware = require('../middleware/auth');
const bookingController = require('../controllers/superAdminBookingController');

const router = express.Router();

const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

router.use(authMiddleware, superAdminMiddleware);

// MUST BE FIRST — before /:id
router.get('/stats', authMiddleware, bookingController.getStats);

router.get('/', authMiddleware, bookingController.list);
router.get('/:id', authMiddleware, bookingController.getOne);
router.post('/:id/confirm', authMiddleware, bookingController.confirm);
router.post('/:id/complete', authMiddleware, bookingController.complete);
router.post('/:id/cancel', authMiddleware, bookingController.cancel);

module.exports = router;
