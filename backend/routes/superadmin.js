const express = require('express');
const authMiddleware = require('../middleware/auth');
const superAdminController = require('../controllers/superAdminController');
const platformSettingsController = require('../controllers/platformSettingsController');

const router = express.Router();

// ===== SUPER ADMIN MIDDLEWARE =====
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

router.get('/organizations', authMiddleware, superAdminMiddleware, superAdminController.listOrganizations);
router.get('/organizations/:id', authMiddleware, superAdminMiddleware, superAdminController.getOrganization);
router.patch('/organizations/:id', authMiddleware, superAdminMiddleware, superAdminController.updateOrganization);
router.post('/organizations/:id/suspend', authMiddleware, superAdminMiddleware, superAdminController.suspendOrganization);
router.post('/organizations/:id/reactivate', authMiddleware, superAdminMiddleware, superAdminController.reactivateOrganization);

router.get('/subscriptions/stats', authMiddleware, superAdminMiddleware, superAdminController.getSubscriptionStats);
router.get('/subscriptions', authMiddleware, superAdminMiddleware, superAdminController.listSubscriptions);
router.get('/subscriptions/:id', authMiddleware, superAdminMiddleware, superAdminController.getSubscription);
router.post('/subscriptions/:id/change-plan', authMiddleware, superAdminMiddleware, superAdminController.changePlan);
router.post('/subscriptions/:id/cancel', authMiddleware, superAdminMiddleware, superAdminController.cancelSubscription);
router.patch('/subscriptions/:id/auto-renew', authMiddleware, superAdminMiddleware, superAdminController.updateAutoRenew);

router.get('/payments', authMiddleware, superAdminMiddleware, superAdminController.listPayments);

router.get('/settings', authMiddleware, superAdminMiddleware, platformSettingsController.get);
router.put('/settings', authMiddleware, superAdminMiddleware, platformSettingsController.update);
router.post('/settings/smtp/test', authMiddleware, superAdminMiddleware, platformSettingsController.testSmtp);

router.get('/dashboard/stats', authMiddleware, superAdminMiddleware, superAdminController.getDashboardStats);
router.get('/bookings/stats', authMiddleware, superAdminMiddleware, superAdminController.getBookingStats);

router.get('/bookings', authMiddleware, superAdminMiddleware, superAdminController.listBookings);
router.get('/bookings/:id', authMiddleware, superAdminMiddleware, superAdminController.getBooking);
router.post('/bookings/:id/confirm', authMiddleware, superAdminMiddleware, superAdminController.confirmBooking);
router.post('/bookings/:id/cancel', authMiddleware, superAdminMiddleware, superAdminController.cancelBooking);
router.post('/bookings/:id/complete', authMiddleware, superAdminMiddleware, superAdminController.completeBooking);

module.exports = router;
