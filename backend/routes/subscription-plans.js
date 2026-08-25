const express = require('express');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');

const router = express.Router();

router.get('/', subscriptionPlanController.list);

module.exports = router;
