const { v4: uuidv4 } = require('uuid');
const PlatformSetting = require('../models/PlatformSetting');
const { encrypt, decrypt } = require('../utils/encryption');

const MASK = '************';

const SENSITIVE_FIELDS = {
  stripe: ['secretKey', 'webhookSecret'],
  razorpay: ['keySecret', 'webhookSecret'],
  paypal: ['clientSecret', 'webhookSecret'],
  paytm: ['merchantKey', 'webhookSecret']
};

const PUBLIC_FIELD = {
  stripe: 'publicKey',
  razorpay: 'keyId',
  paypal: 'clientId',
  paytm: null
};

const GATEWAY_LABELS = { stripe: 'Stripe', razorpay: 'Razorpay', paypal: 'PayPal', paytm: 'Paytm' };

const DEFAULT_GENERAL = { platformName: 'CQA Booking', supportEmail: '', supportPhone: '', smtpHost: '' };
const DEFAULT_REGIONAL = { defaultCurrency: 'USD', defaultTimezone: 'UTC' };
const DEFAULT_PLATFORM_CONTROLS = { allowNewRegistrations: true, maintenanceMode: false };

const DEFAULT_PAYMENT_GATEWAYS = {
  stripe: { enabled: false, environment: 'test', publicKey: '', secretKey: '', webhookSecret: '' },
  razorpay: { enabled: false, environment: 'test', keyId: '', keySecret: '', webhookSecret: '' },
  paypal: { enabled: false, environment: 'sandbox', clientId: '', clientSecret: '', webhookSecret: '' },
  paytm: { enabled: false, environment: 'test', merchantId: '', merchantKey: '', website: 'WEBSTAGING', webhookSecret: '' }
};

// This MySQL/Sequelize/mysql2 combination returns JSON columns as raw text
// rather than auto-parsed objects, so every read must parse defensively —
// spreading an un-parsed string spreads its characters into numeric keys.
function readSettingValue(row) {
  const value = row?.settingValue;
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

async function upsertSetting(key, value, category, isSensitive = false) {
  const existing = await PlatformSetting.findOne({ where: { settingKey: key } });
  if (existing) {
    await existing.update({ settingValue: value, category, isSensitive });
  } else {
    await PlatformSetting.create({ id: uuidv4(), settingKey: key, settingValue: value, category, isSensitive });
  }
}

function maskGateways(gateways) {
  const result = {};
  for (const [provider, cfg] of Object.entries(gateways)) {
    const sensitiveFields = SENSITIVE_FIELDS[provider] || [];
    const masked = { ...cfg };
    for (const field of sensitiveFields) {
      masked[field] = cfg[field] ? MASK : '';
    }
    result[provider] = masked;
  }
  return result;
}

// ===== GET MERGED, MASKED SETTINGS (safe to send to the frontend) =====
exports.getSettings = async () => {
  const [generalRow, regionalRow, controlsRow, gatewaysRow] = await Promise.all([
    PlatformSetting.findOne({ where: { settingKey: 'general' } }),
    PlatformSetting.findOne({ where: { settingKey: 'regional' } }),
    PlatformSetting.findOne({ where: { settingKey: 'platform_controls' } }),
    PlatformSetting.findOne({ where: { settingKey: 'payment_gateways' } })
  ]);

  const general = { ...DEFAULT_GENERAL, ...readSettingValue(generalRow) };
  const regional = { ...DEFAULT_REGIONAL, ...readSettingValue(regionalRow) };
  const platformControls = { ...DEFAULT_PLATFORM_CONTROLS, ...readSettingValue(controlsRow) };

  const storedGateways = readSettingValue(gatewaysRow);
  const mergedGateways = {};
  for (const provider of Object.keys(DEFAULT_PAYMENT_GATEWAYS)) {
    mergedGateways[provider] = { ...DEFAULT_PAYMENT_GATEWAYS[provider], ...(storedGateways[provider] || {}) };
  }

  return {
    ...general,
    ...regional,
    ...platformControls,
    paymentGateways: maskGateways(mergedGateways)
  };
};

// ===== UPDATE SETTINGS (encrypts new secrets, preserves untouched ones) =====
exports.updateSettings = async (payload) => {
  const general = {
    platformName: payload.platformName ?? DEFAULT_GENERAL.platformName,
    supportEmail: payload.supportEmail ?? '',
    supportPhone: payload.supportPhone ?? '',
    smtpHost: payload.smtpHost ?? ''
  };
  const regional = {
    defaultCurrency: payload.defaultCurrency ?? DEFAULT_REGIONAL.defaultCurrency,
    defaultTimezone: payload.defaultTimezone ?? DEFAULT_REGIONAL.defaultTimezone
  };
  const platformControls = {
    allowNewRegistrations: !!payload.allowNewRegistrations,
    maintenanceMode: !!payload.maintenanceMode
  };

  const existingGatewaysRow = await PlatformSetting.findOne({ where: { settingKey: 'payment_gateways' } });
  const existingGateways = readSettingValue(existingGatewaysRow);
  const incomingGateways = payload.paymentGateways || {};
  const nextGateways = {};

  for (const provider of Object.keys(DEFAULT_PAYMENT_GATEWAYS)) {
    const incoming = { ...DEFAULT_PAYMENT_GATEWAYS[provider], ...(incomingGateways[provider] || {}) };
    const existingStored = existingGateways[provider] || {};
    const sensitiveFields = SENSITIVE_FIELDS[provider] || [];

    const merged = { ...incoming };
    for (const field of sensitiveFields) {
      const incomingValue = incoming[field];
      if (!incomingValue || incomingValue === MASK) {
        // Untouched in the UI — keep whatever is already stored (still encrypted).
        merged[field] = existingStored[field] || '';
      } else {
        merged[field] = encrypt(incomingValue);
      }
    }
    nextGateways[provider] = merged;
  }

  await Promise.all([
    upsertSetting('general', general, 'general'),
    upsertSetting('regional', regional, 'general'),
    upsertSetting('platform_controls', platformControls, 'general'),
    upsertSetting('payment_gateways', nextGateways, 'payment', true)
  ]);

  return exports.getSettings();
};

// ===== INTERNAL: decrypted gateway config for backend payment services (never exposed via any route) =====
exports.getDecryptedGateway = async (provider) => {
  const row = await PlatformSetting.findOne({ where: { settingKey: 'payment_gateways' } });
  const stored = readSettingValue(row)[provider];
  if (!stored) return null;

  const sensitiveFields = SENSITIVE_FIELDS[provider] || [];
  const decrypted = { ...stored };
  for (const field of sensitiveFields) {
    decrypted[field] = stored[field] ? decrypt(stored[field]) : '';
  }
  return decrypted;
};

// ===== PUBLIC: list of enabled gateways with only their public identifiers =====
exports.getPublicEnabledGateways = async () => {
  const row = await PlatformSetting.findOne({ where: { settingKey: 'payment_gateways' } });
  const stored = readSettingValue(row);

  const result = [];
  for (const provider of Object.keys(DEFAULT_PAYMENT_GATEWAYS)) {
    const cfg = stored[provider];
    if (!cfg?.enabled) continue;

    const publicFieldKey = PUBLIC_FIELD[provider];
    result.push({
      provider,
      label: GATEWAY_LABELS[provider],
      environment: cfg.environment,
      ...(publicFieldKey ? { [publicFieldKey]: cfg[publicFieldKey] || '' } : {})
    });
  }
  return result;
};

exports.SENSITIVE_FIELDS = SENSITIVE_FIELDS;
exports.MASK = MASK;
