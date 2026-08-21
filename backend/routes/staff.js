const express = require('express');
const authMiddleware = require('../middleware/auth');
const staffController = require('../controllers/staffController');

const router = express.Router();

router.get('/', authMiddleware, staffController.list);
router.post('/', authMiddleware, staffController.create);

module.exports = router;
