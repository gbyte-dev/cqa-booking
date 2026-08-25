const express = require('express');
const authMiddleware = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.get('/me', authMiddleware, profileController.getMe);
router.patch('/me', authMiddleware, profileController.updateMe);
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), profileController.uploadAvatar);

module.exports = router;
