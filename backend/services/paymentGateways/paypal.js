// PayPal adapter — config is the decrypted gateway config from
// platformSettingsService.getDecryptedGateway('paypal'). Uses PayPal's REST
// API directly via the Node 22 global fetch (no SDK dependency needed).
// NOT verified end-to-end (no sandbox credentials available).
//
// Note on "webhookSecret": PayPal doesn't issue a signing secret — webhook
// verification instead requires the "Webhook ID" shown in the PayPal
// dashboard when you register an endpoint. Since the existing Super Admin UI
// only has one generic "Webhook Secret" field per gateway (and that page is
// not being redesigned), that field holds PayPal's Webhook ID for this
// provider.

function baseUrl(config) {
  return config.environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(config) {
  const base = baseUrl(config);
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'PayPal authentication failed');

  return { accessToken: data.access_token, base };
}

exports.createOrder = async ({ config, amount, currency, reference, description }) => {
  const { accessToken, base } = await getAccessToken(config);

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: reference,
        custom_id: reference,
        description,
        amount: { currency_code: currency || 'USD', value: Number(amount).toFixed(2) }
      }]
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'PayPal order creation failed');

  return { orderId: data.id, clientId: config.clientId };
};

exports.verify = async ({ config, orderId }) => {
  const { accessToken, base } = await getAccessToken(config);

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  return { verified: res.ok && data.status === 'COMPLETED', externalId: orderId };
};

exports.verifyWebhook = async ({ config, rawBody, headers }) => {
  const { accessToken, base } = await getAccessToken(config);
  const event = JSON.parse(rawBody.toString('utf8'));

  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: config.webhookSecret,
      webhook_event: event
    })
  });

  const data = await res.json();
  if (data.verification_status !== 'SUCCESS') {
    return { verified: false };
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'CHECKOUT.ORDER.APPROVED') {
    const resource = event.resource;
    const reference = resource?.purchase_units?.[0]?.reference_id || resource?.custom_id;
    return { verified: true, externalId: resource?.id, reference };
  }

  return { verified: false };
};
