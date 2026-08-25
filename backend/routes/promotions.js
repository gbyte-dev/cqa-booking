const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const promotionController = require('../controllers/promotionController');

const router = express.Router();
router.use(authMiddleware);
router.use(requireVerifiedEmail);

router.get('/', promotionController.list);
router.post('/', promotionController.create);
router.post('/validate', promotionController.validate);
router.patch('/:id', promotionController.update);

module.exports = router;
