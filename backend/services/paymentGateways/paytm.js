// Paytm adapter — config is the decrypted gateway config from
// platformSettingsService.getDecryptedGateway('paytm'). Uses the official
// `paytmchecksum` package for signing/verifying, and the Node 22 global
// fetch for the REST calls (Paytm has no maintained official Node SDK).
// NOT verified end-to-end (no merchant sandbox credentials available).
//
// Paytm lets the merchant choose its own ORDERID, so our own Subscription id
// (`reference`) is used directly as the Paytm order id — this keeps the same
// externalSubscriptionId-based webhook lookup used for the other providers.

const paytmChecksum = require('paytmchecksum');

function baseUrl(config) {
  return config.environment === 'live' ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';
}

exports.createOrder = async ({ config, amount, currency, reference }) => {
  const base = baseUrl(config);

  const body = {
    requestType: 'Payment',
    mid: config.merchantId,
    websiteName: config.website || 'WEBSTAGING',
    orderId: reference,
    txnAmount: { value: Number(amount).toFixed(2), currency: currency || 'INR' },
    userInfo: { custId: reference }
  };

  const signature = await paytmChecksum.generateSignature(JSON.stringify(body), config.merchantKey);

  const res = await fetch(`${base}/theia/api/v1/initiateTransaction?mid=${config.merchantId}&orderId=${reference}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, head: { signature } })
  });

  const data = await res.json();
  if (data.body?.resultInfo?.resultStatus !== 'S') {
    throw new Error(data.body?.resultInfo?.resultMsg || 'Paytm order initiation failed');
  }

  return {
    orderId: reference,
    txnToken: data.body.txnToken,
    amount: Number(amount).toFixed(2),
    mid: config.merchantId,
    website: config.website || 'WEBSTAGING'
  };
};

exports.verify = async ({ config, orderId }) => {
  const base = baseUrl(config);
  const body = { mid: config.merchantId, orderId };
  const signature = await paytmChecksum.generateSignature(JSON.stringify(body), config.merchantKey);

  const res = await fetch(`${base}/v3/order/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, head: { signature } })
  });

  const data = await res.json();
  const verified = data.body?.resultInfo?.resultStatus === 'TXN_SUCCESS';

  return { verified, externalId: data.body?.txnId || orderId };
};

exports.verifyWebhook = async ({ config, rawBody }) => {
  const payload = JSON.parse(rawBody.toString('utf8'));
  const receivedSignature = payload.head?.signature;

  const isValid = await paytmChecksum.verifySignature(JSON.stringify(payload.body), config.merchantKey, receivedSignature);
  if (!isValid) {
    return { verified: false };
  }

  const body = payload.body || {};
  const verified = body.resultInfo?.resultStatus === 'TXN_SUCCESS';

  return { verified, externalId: body.orderId, reference: body.orderId };
};
