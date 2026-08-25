const platformSettingsService = require('../services/platformSettingsService');
const { writeAudit } = require('../utils/audit');
const mailService = require('../services/mailService');

const ALLOWED_ENVIRONMENTS = {
  stripe: ['test', 'live'],
  razorpay: ['test', 'live'],
  paypal: ['sandbox', 'live'],
  paytm: ['test', 'live']
};

// ===== GET PLATFORM SETTINGS =====
exports.get = async (req, res) => {
  try {
    const settings = await platformSettingsService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get platform settings error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== UPDATE PLATFORM SETTINGS =====
exports.update = async (req, res) => {
  try {
    const payload = req.body || {};

    if (payload.paymentGateways) {
      for (const [provider, allowed] of Object.entries(ALLOWED_ENVIRONMENTS)) {
        const cfg = payload.paymentGateways[provider];
        if (cfg?.environment && !allowed.includes(cfg.environment)) {
          return res.status(400).json({
            success: false,
            error: `Invalid environment for ${provider}. Must be one of: ${allowed.join(', ')}`
          });
        }
      }
    }

    const settings = await platformSettingsService.updateSettings(payload);

    // Never write credential values into the audit trail — only which gateways changed state.
    const gatewayStatus = Object.fromEntries(
      Object.entries(settings.paymentGateways || {}).map(([provider, cfg]) => [provider, { enabled: cfg.enabled, environment: cfg.environment }])
    );
    await writeAudit({ req, action: 'platform_settings.updated', entityType: 'platform_setting', entityId: 'payment_gateways', metadata: { gatewayStatus } });

    res.json({ success: true, data: settings, message: 'Platform settings saved successfully' });
  } catch (error) {
    console.error('Update platform settings error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== TEST SMTP CONNECTION =====
exports.testSmtp = async (req, res) => {
  try {
    const testEmail = req.body?.testEmail || req.user?.email;
    if (!testEmail) {
      return res.status(400).json({ success: false, error: 'A test email address is required' });
    }

    await mailService.sendTestEmail(testEmail);

    await writeAudit({ req, action: 'platform_settings.smtp_tested', entityType: 'platform_setting', entityId: 'smtp', metadata: { testEmail } });

    res.json({ success: true, message: `Test email sent successfully to ${testEmail}.` });
  } catch (error) {
    console.error('Test SMTP error:', error.message);
    res.status(400).json({ success: false, error: error.message || 'Could not connect to SMTP server. Check host, port and credentials.' });
  }
};
