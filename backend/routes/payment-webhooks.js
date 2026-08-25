const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

const SUPPORTED_PROVIDERS = ['stripe', 'razorpay', 'paypal', 'paytm'];

// Mounted with express.raw() in server.js (before the global express.json()
// middleware) — signature verification for these providers needs the exact
// raw request body, not a re-serialized parsed copy.
router.post('/:provider', express.raw({ type: '*/*' }), async (req, res) => {
  const { provider } = req.params;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return res.status(404).json({ success: false, error: 'Unknown payment provider' });
  }

  try {
    const result = await authService.handlePaymentWebhook({ provider, rawBody: req.body, headers: req.headers });
    res.json({ received: true, handled: result.handled });
  } catch (error) {
    console.error(`Webhook error (${provider}):`, error.message);
    res.status(400).json({ received: false, error: 'Webhook verification failed' });
  }
});

module.exports = router;
