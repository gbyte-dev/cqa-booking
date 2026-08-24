const express = require('express');
const requireRole = require('../middleware/roleCheck');
const authMiddleware = require('../middleware/auth');
const organizationController = require('../controllers/organizationController');

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

// Tenant owners view their own organization + plan — no superadmin check, scoped by their own token.
router.get('/me', authMiddleware, requireRole(['owner']), organizationController.getMine);

router.get('/', authMiddleware, superAdminMiddleware, organizationController.list);
router.get('/:id', authMiddleware, superAdminMiddleware, organizationController.getOne);
router.post('/', authMiddleware, superAdminMiddleware, organizationController.create);
router.patch('/:id', authMiddleware, superAdminMiddleware, organizationController.update);
router.delete('/:id', authMiddleware, superAdminMiddleware, organizationController.remove);
router.post('/:id/suspend', authMiddleware, superAdminMiddleware, organizationController.suspend);
router.post('/:id/reactivate', authMiddleware, superAdminMiddleware, organizationController.reactivate);

module.exports = router;
