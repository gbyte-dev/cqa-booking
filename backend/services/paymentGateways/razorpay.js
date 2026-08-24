// Razorpay adapter — config is the decrypted gateway config from
// platformSettingsService.getDecryptedGateway('razorpay').
// NOT verified end-to-end (no sandbox credentials available) — written
// against Razorpay's documented order-creation and signature-verification
// scheme, ready to activate once real test keys are configured.

const crypto = require('crypto');

function client(config) {
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
}

exports.createOrder = async ({ config, amount, currency, reference }) => {
  const instance = client(config);
  const order = await instance.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: currency || 'INR',
    receipt: reference,
    notes: { reference }
  });

  return { orderId: order.id, keyId: config.keyId, amount: order.amount, currency: order.currency };
};

exports.verify = async ({ config, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { verified: false };
  }

  const expected = crypto
    .createHmac('sha256', config.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return { verified: expected === razorpay_signature, externalId: razorpay_payment_id };
};

exports.verifyWebhook = async ({ config, rawBody, headers }) => {
  const signature = headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', config.webhookSecret).update(rawBody).digest('hex');

  if (expected !== signature) {
    return { verified: false };
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  const payment = event.payload?.payment?.entity;

  if (event.event === 'payment.captured' && payment) {
    return { verified: true, externalId: payment.order_id, reference: payment.notes?.reference };
  }

  return { verified: false };
};
