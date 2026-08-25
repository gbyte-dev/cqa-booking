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

const SMTP_SENSITIVE_FIELDS = ['password'];

const PUBLIC_FIELD = {
  stripe: 'publicKey',
  razorpay: 'keyId',
  paypal: 'clientId',
  paytm: null
};

const GATEWAY_LABELS = { stripe: 'Stripe', razorpay: 'Razorpay', paypal: 'PayPal', paytm: 'Paytm' };

const DEFAULT_GENERAL = { platformName: 'CQA Booking', supportEmail: '', supportPhone: '' };
const DEFAULT_REGIONAL = { defaultCurrency: 'USD', defaultTimezone: 'UTC' };
const DEFAULT_PLATFORM_CONTROLS = { allowNewRegistrations: true, maintenanceMode: false };
const DEFAULT_SMTP = { host: '', port: 587, encryption: 'tls', username: '', password: '', fromEmail: '', fromName: '' };
const VALID_ENCRYPTIONS = ['none', 'ssl', 'tls'];

const DEFAULT_PAYMENT_GATEWAYS = {
  stripe: { enabled: false, environment: 'test', publicKey: '', secretKey: '', webhookSecret: '' },
  razorpay: { enabled: false, environment: 'test', keyId: '', keySecret: '', webhookSecret: '' },
  paypal: { enabled: false, environment: 'sandbox', clientId: '', clientSecret: '', webhookSecret: '' },
  paytm: { enabled: false, environment: 'test', merchantId: '', merchantKey: '', website: 'WEBSTAGING', webhookSecret: '' }
};

// This MySQL/Sequelize/mysql2 combination returns JSON columns as raw text
// rather than auto-parsed objects, so every read must parse defensively —
// spreading an un-parsed string spreads its characters into numeric keys.
// Older rows may only have a legacy boolean `secure` flag (saved before the
// encryption dropdown was fixed to distinguish SSL from TLS). Migrate those
// on read so existing saved settings don't silently misbehave.
function normalizeSmtp(raw) {
  const merged = { ...DEFAULT_SMTP, ...raw };
  if (!VALID_ENCRYPTIONS.includes(merged.encryption)) {
    merged.encryption = raw && typeof raw.secure === 'boolean'
      ? (raw.secure ? 'ssl' : 'tls')
      : DEFAULT_SMTP.encryption;
  }
  delete merged.secure;
  return merged;
}

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

function maskSensitive(obj, fields) {
  const masked = { ...obj };
  for (const field of fields) {
    masked[field] = obj[field] ? MASK : '';
  }
  return masked;
}

// ===== GET MERGED, MASKED SETTINGS (safe to send to the frontend) =====
exports.getSettings = async () => {
  const [generalRow, regionalRow, controlsRow, gatewaysRow, smtpRow] = await Promise.all([
    PlatformSetting.findOne({ where: { settingKey: 'general' } }),
    PlatformSetting.findOne({ where: { settingKey: 'regional' } }),
    PlatformSetting.findOne({ where: { settingKey: 'platform_controls' } }),
    PlatformSetting.findOne({ where: { settingKey: 'payment_gateways' } }),
    PlatformSetting.findOne({ where: { settingKey: 'smtp' } })
  ]);

  const general = { ...DEFAULT_GENERAL, ...readSettingValue(generalRow) };
  const regional = { ...DEFAULT_REGIONAL, ...readSettingValue(regionalRow) };
  const platformControls = { ...DEFAULT_PLATFORM_CONTROLS, ...readSettingValue(controlsRow) };
  const smtp = normalizeSmtp(readSettingValue(smtpRow));

  const storedGateways = readSettingValue(gatewaysRow);
  const mergedGateways = {};
  for (const provider of Object.keys(DEFAULT_PAYMENT_GATEWAYS)) {
    mergedGateways[provider] = { ...DEFAULT_PAYMENT_GATEWAYS[provider], ...(storedGateways[provider] || {}) };
  }

  return {
    ...general,
    ...regional,
    ...platformControls,
    paymentGateways: maskGateways(mergedGateways),
    smtp: maskSensitive(smtp, SMTP_SENSITIVE_FIELDS)
  };
};

// ===== UPDATE SETTINGS (encrypts new secrets, preserves untouched ones) =====
exports.updateSettings = async (payload) => {
  const general = {
    platformName: payload.platformName ?? DEFAULT_GENERAL.platformName,
    supportEmail: payload.supportEmail ?? '',
    supportPhone: payload.supportPhone ?? ''
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

  const existingSmtpRow = await PlatformSetting.findOne({ where: { settingKey: 'smtp' } });
  const existingSmtp = normalizeSmtp(readSettingValue(existingSmtpRow));
  const incomingSmtp = payload.smtp || {};
  const smtp = {
    host: incomingSmtp.host ?? DEFAULT_SMTP.host,
    port: Number(incomingSmtp.port) || DEFAULT_SMTP.port,
    encryption: VALID_ENCRYPTIONS.includes(incomingSmtp.encryption) ? incomingSmtp.encryption : DEFAULT_SMTP.encryption,
    username: incomingSmtp.username ?? DEFAULT_SMTP.username,
    fromEmail: incomingSmtp.fromEmail ?? DEFAULT_SMTP.fromEmail,
    fromName: incomingSmtp.fromName ?? DEFAULT_SMTP.fromName,
    password: DEFAULT_SMTP.password
  };
  for (const field of SMTP_SENSITIVE_FIELDS) {
    const incomingValue = incomingSmtp[field];
    if (!incomingValue || incomingValue === MASK) {
      smtp[field] = existingSmtp[field] || '';
    } else {
      smtp[field] = encrypt(incomingValue);
    }
  }

  await Promise.all([
    upsertSetting('general', general, 'general'),
    upsertSetting('regional', regional, 'general'),
    upsertSetting('platform_controls', platformControls, 'general'),
    upsertSetting('payment_gateways', nextGateways, 'payment', true),
    upsertSetting('smtp', smtp, 'email', true)
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

// ===== INTERNAL: decrypted SMTP config for the mail service (never exposed via any route) =====
exports.getDecryptedSmtp = async () => {
  const row = await PlatformSetting.findOne({ where: { settingKey: 'smtp' } });
  const stored = normalizeSmtp(readSettingValue(row));

  const decrypted = { ...stored };
  for (const field of SMTP_SENSITIVE_FIELDS) {
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
