const express = require('express');
const authMiddleware = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', notificationController.list);
router.post('/queue', notificationController.queue);

module.exports = router;
