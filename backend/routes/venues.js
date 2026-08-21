const express = require('express');
const authMiddleware = require('../middleware/auth');
const venueController = require('../controllers/venueController');

const router = express.Router();

router.post('/', authMiddleware, venueController.create);
router.get('/', authMiddleware, venueController.list);
router.get('/:id', authMiddleware, venueController.getOne);
router.patch('/:id', authMiddleware, venueController.update);
router.delete('/:id', authMiddleware, venueController.remove);

module.exports = router;
