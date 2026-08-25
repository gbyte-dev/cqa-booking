// Stripe adapter — config is the decrypted gateway config from
// platformSettingsService.getDecryptedGateway('stripe').

function client(config) {
  return require('stripe')(config.secretKey);
}

exports.createOrder = async ({ config, amount, currency, reference, description }) => {
  const stripe = client(config);
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency: String(currency || 'USD').toLowerCase(),
    description,
    metadata: { reference }
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
};

exports.verify = async ({ config, reference, expectedAmount, paymentIntentId }) => {
  const stripe = client(config);
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const expectedCents = Math.round(Number(expectedAmount) * 100);
  const verified = intent.status === 'succeeded' && intent.amount === expectedCents && intent.metadata?.reference === reference;

  return { verified, externalId: intent.id };
};

exports.verifyWebhook = async ({ config, rawBody, headers }) => {
  const stripe = client(config);
  const signature = headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    return { verified: true, externalId: intent.id, reference: intent.metadata?.reference };
  }

  return { verified: false };
};
