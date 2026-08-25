const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/register/customer', authController.registerCustomer);
router.post('/register/owner/validate', authController.validateOwnerRegistration);
router.get('/register/owner/payment-gateways', authController.getOwnerPaymentGateways);
router.post('/register/owner/payment-intent', authController.createOwnerPaymentIntent);
router.post('/register/owner/confirm', authController.confirmOwnerPayment);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;
