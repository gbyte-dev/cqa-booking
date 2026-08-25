const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const tableController = require('../controllers/tableController');

const router = express.Router();
router.use(authMiddleware, requireVerifiedEmail);

router.post('/', authMiddleware, tableController.create);
router.get('/venue/:venueId', authMiddleware, tableController.listByVenue);
router.patch('/:id', authMiddleware, tableController.update);
router.delete('/:id', authMiddleware, tableController.remove);

module.exports = router;
