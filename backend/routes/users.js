const express = require('express');
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// ===== MIDDLEWARE: CHECK SUPER ADMIN =====
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

router.get('/customers', authMiddleware, superAdminMiddleware, userController.listCustomers);
router.get('/:id', authMiddleware, superAdminMiddleware, userController.getOne);
router.get('/:id/bookings', authMiddleware, superAdminMiddleware, userController.getBookings);
router.patch('/:id', authMiddleware, superAdminMiddleware, userController.update);
router.delete('/:id', authMiddleware, superAdminMiddleware, userController.remove);
router.post('/:id/suspend', authMiddleware, superAdminMiddleware, userController.suspend);
router.post('/:id/reactivate', authMiddleware, superAdminMiddleware, userController.reactivate);

module.exports = router;
