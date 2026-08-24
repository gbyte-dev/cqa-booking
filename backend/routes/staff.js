const express = require('express');
const requireRole = require('../middleware/roleCheck');
const authMiddleware = require('../middleware/auth');
const staffController = require('../controllers/staffController');

const router = express.Router();

// MUST BE BEFORE any '/:id' style route if one is ever added — 'managers'
// would otherwise be misread as an :id.
router.get('/managers', authMiddleware, requireRole(['owner']), staffController.listManagers);

router.get('/', authMiddleware, requireRole(['owner']), staffController.list);
router.post('/', authMiddleware, requireRole(['owner']), staffController.create);
router.patch('/:id', authMiddleware, requireRole(['owner']), staffController.update);
router.post('/:id/suspend', authMiddleware, requireRole(['owner']), staffController.suspend);
router.post('/:id/reactivate', authMiddleware, requireRole(['owner']), staffController.reactivate);
router.delete('/:id', authMiddleware, requireRole(['owner']), staffController.remove);

module.exports = router;
