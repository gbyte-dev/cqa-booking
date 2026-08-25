
const requireRole = require('../middleware/roleCheck');

const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const venueController = require('../controllers/venueController');

const router = express.Router();
router.use(authMiddleware, requireVerifiedEmail);


router.post('/', authMiddleware,requireRole(['owner']), venueController.create);
router.get('/', authMiddleware, venueController.list);
router.get('/:id', authMiddleware, venueController.getOne);
router.patch('/:id', authMiddleware, requireRole(['owner']), venueController.update);
router.delete('/:id', authMiddleware, requireRole(['owner']), venueController.remove);

module.exports = router;
