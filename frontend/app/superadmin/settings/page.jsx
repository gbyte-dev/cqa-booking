'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Globe,
  Shield,
  CreditCard,
  Save,
  Mail,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/alerts';
import { storage } from '@/lib/storage';
import { getPlatformSettings, updatePlatformSettings, sendTestSmtpEmail } from '@/lib/settings';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_SETTINGS = {
  platformName: '',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'USD',
  defaultTimezone: 'UTC',
  allowNewRegistrations: true,
  maintenanceMode: false,

  smtp: {
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
  },

  paymentGateways: {
    stripe: {
      enabled: false,
      environment: 'test',
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
    },

    razorpay: {
      enabled: false,
      environment: 'test',
      keyId: '',
      keySecret: '',
      webhookSecret: '',
    },

    paypal: {
      enabled: false,
      environment: 'sandbox',
      clientId: '',
      clientSecret: '',
      webhookSecret: '',
    },

    paytm: {
      enabled: false,
      environment: 'test',
      merchantId: '',
      merchantKey: '',
      website: 'WEBSTAGING',
      webhookSecret: '',
    },
  },
};

export default function PlatformSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user || user.role !== 'superadmin') {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const result = await getPlatformSettings(token);
        if (result.success) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...result.data,
            paymentGateways: { ...DEFAULT_SETTINGS.paymentGateways, ...result.data.paymentGateways },
            smtp: { ...DEFAULT_SETTINGS.smtp, ...result.data.smtp },
          });
        }
      } catch (error) {
        notifyError(error.message || 'Failed to load platform settings.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     General Settings Change
  ========================================================= */

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     Gateway Settings Change
  ========================================================= */

  const handleGatewayChange = (
    gateway,
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,

      paymentGateways: {
        ...prev.paymentGateways,

        [gateway]: {
          ...prev.paymentGateways[gateway],
          [field]: value,
        },
      },
    }));
  };

  /* =========================================================
     SMTP Settings Change
  ========================================================= */

  const handleSmtpChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [field]: value,
      },
    }));
  };

  /* =========================================================
     Save Settings
  ========================================================= */

  const validateSmtp = () => {
    const { port, fromEmail } = settings.smtp;

    if (port !== '' && port !== null && (Number.isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535)) {
      return 'Mail port must be a number between 1 and 65535.';
    }

    if (fromEmail && !EMAIL_REGEX.test(fromEmail)) {
      return 'Please enter a valid "From Email" address.';
    }

    return null;
  };

  const handleSave = async () => {
    const smtpError = validateSmtp();
    if (smtpError) {
      notifyError(smtpError);
      return;
    }

    setSaving(true);

    try {
      const token = storage.getToken();
      const result = await updatePlatformSettings(token, settings);

      if (result.success) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...result.data,
          paymentGateways: { ...DEFAULT_SETTINGS.paymentGateways, ...result.data.paymentGateways },
          smtp: { ...DEFAULT_SETTINGS.smtp, ...result.data.smtp },
        });
        notifySuccess(result.message || 'Platform settings saved successfully.');
      } else {
        notifyError(result.error || 'Failed to save platform settings.');
      }
    } catch (error) {
      notifyError(error?.message || 'Failed to save platform settings.');
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Send Test SMTP Email
  ========================================================= */

  const handleTestEmail = async () => {
    const smtpError = validateSmtp();
    if (smtpError) {
      notifyError(smtpError);
      return;
    }

    if (!settings.smtp.host || !settings.smtp.username) {
      notifyError('Please fill in the Mail Host and Mail Username before testing.');
      return;
    }

    const testEmail = settings.smtp.fromEmail || settings.supportEmail;
    if (!testEmail) {
      notifyError('Please provide a "From Email" to send the test email to.');
      return;
    }

    setTesting(true);

    try {
      const token = storage.getToken();
      const result = await sendTestSmtpEmail(token, testEmail);

      if (result.success) {
        notifySuccess(result.message || `Test email sent to ${testEmail}.`);
      } else {
        notifyError(result.error || 'Could not connect to SMTP server. Check host, port and credentials.');
      }
    } catch (error) {
      notifyError(error?.message || 'Could not connect to SMTP server. Check host, port and credentials.');
    } finally {
      setTesting(false);
    }
  };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

          <p className="mt-4 text-sm text-gray-600">
            Loading Platform Settings...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =====================================================
            Page Header
        ===================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <Settings className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="min-w-0">

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Platform Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Configure global platform preferences,
                access controls and payment gateways.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            General Settings
        ===================================================== */}

        <SettingsSection
          title="General Settings"
          description="Platform identity and contact information"
          icon={
            <Settings className="h-5 w-5 text-gray-400" />
          }
        >

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InputField
              label="Platform Name"
              value={settings.platformName}
              onChange={(value) =>
                handleChange(
                  'platformName',
                  value
                )
              }
              placeholder="Bookly Platform"
            />

            <InputField
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(value) =>
                handleChange(
                  'supportEmail',
                  value
                )
              }
              placeholder="support@example.com"
            />

            <InputField
              label="Support Phone"
              type="tel"
              value={settings.supportPhone}
              onChange={(value) =>
                handleChange(
                  'supportPhone',
                  value
                )
              }
              placeholder="+1 234 567 890"
            />

          </div>

        </SettingsSection>


        {/* =====================================================
            Email / SMTP Configuration
        ===================================================== */}

        <SettingsSection
          title="Email / SMTP Configuration"
          description="Configure the outgoing mail server used for verification and notification emails."
          icon={
            <Mail className="h-5 w-5 text-gray-400" />
          }
        >

          <div className="mb-5 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                settings.smtp.host && settings.smtp.username
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {settings.smtp.host && settings.smtp.username ? 'SMTP Configured' : 'SMTP Not Configured'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InputField
              label="Mail Host"
              value={settings.smtp.host}
              onChange={(value) => handleSmtpChange('host', value)}
              placeholder="smtp.example.com"
            />

            <InputField
              label="Mail Port"
              type="number"
              value={settings.smtp.port}
              onChange={(value) => handleSmtpChange('port', value)}
              placeholder="587"
            />

            <InputField
              label="Mail Username"
              value={settings.smtp.username}
              onChange={(value) => handleSmtpChange('username', value)}
              placeholder="apikey or you@example.com"
            />

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mail Password
              </label>

              <div className="relative">
                <input
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={settings.smtp.password}
                  onChange={(e) => handleSmtpChange('password', e.target.value)}
                  placeholder={settings.smtp.password ? '••••••••' : 'Enter mail password'}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowSmtpPassword((v) => !v)}
                  className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
                  aria-label={showSmtpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <SelectField
              label="Encryption"
              value={settings.smtp.encryption}
              onChange={(value) => handleSmtpChange('encryption', value)}
              options={[
                ['none', 'None'],
                ['tls', 'TLS'],
                ['ssl', 'SSL'],
              ]}
            />

            <InputField
              label="From Email"
              type="email"
              value={settings.smtp.fromEmail}
              onChange={(value) => handleSmtpChange('fromEmail', value)}
              placeholder="no-reply@example.com"
            />

            <InputField
              label="From Name"
              value={settings.smtp.fromName}
              onChange={(value) => handleSmtpChange('fromName', value)}
              placeholder="CQA Booking Platform"
            />

          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing || !settings.smtp.host || !settings.smtp.username}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  Testing connection...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Test Email
                </>
              )}
            </button>
          </div>

        </SettingsSection>


        {/* =====================================================
            Platform Controls + Regional Settings
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ===================================================
              Platform Controls
          =================================================== */}

          <SettingsSection
            title="Platform Controls"
            description="Access and platform availability"
            icon={
              <Shield className="h-5 w-5 text-gray-400" />
            }
          >

            <div className="space-y-4">

              <ToggleRow
                title="Allow New Registrations"
                description="Allow new organizations to register on the platform."
                enabled={
                  settings.allowNewRegistrations
                }
                onChange={() =>
                  handleChange(
                    'allowNewRegistrations',
                    !settings.allowNewRegistrations
                  )
                }
              />

              <ToggleRow
                title="Maintenance Mode"
                description="Temporarily restrict platform access while maintenance is being performed."
                enabled={
                  settings.maintenanceMode
                }
                onChange={() =>
                  handleChange(
                    'maintenanceMode',
                    !settings.maintenanceMode
                  )
                }
              />

            </div>

          </SettingsSection>


          {/* ===================================================
              Regional Settings
          =================================================== */}

          <SettingsSection
            title="Regional Settings"
            description="Default currency and timezone"
            icon={
              <Globe className="h-5 w-5 text-gray-400" />
            }
          >

            <div className="grid grid-cols-1 gap-5">

              <SelectField
                label="Default Currency"
                value={settings.defaultCurrency}
                onChange={(value) =>
                  handleChange(
                    'defaultCurrency',
                    value
                  )
                }
                options={[
                  ['USD', 'USD — US Dollar'],
                  ['EUR', 'EUR — Euro'],
                  ['GBP', 'GBP — British Pound'],
                  ['INR', 'INR — Indian Rupee'],
                  ['AUD', 'AUD — Australian Dollar'],
                ]}
              />

              <SelectField
                label="Default Timezone"
                value={settings.defaultTimezone}
                onChange={(value) =>
                  handleChange(
                    'defaultTimezone',
                    value
                  )
                }
                options={[
                  ['UTC', 'UTC'],
                  [
                    'Asia/Kolkata',
                    'Asia/Kolkata (IST)',
                  ],
                  [
                    'America/New_York',
                    'America/New_York',
                  ],
                  [
                    'Europe/London',
                    'Europe/London',
                  ],
                  [
                    'Asia/Tokyo',
                    'Asia/Tokyo',
                  ],
                ]}
              />

            </div>

          </SettingsSection>

        </div>


        {/* =====================================================
            Payment Gateways
        ===================================================== */}

        <SettingsSection
          title="Payment Gateways"
          description="Configure payment gateways available for tenant subscriptions."
          icon={
            <CreditCard className="h-5 w-5 text-gray-400" />
          }
        >

          {/*

            Responsive:

            Mobile:
            1 card

            Tablet:
            2 cards

            Large Desktop:
            3 cards

            Extra Large Desktop:
            3 cards

            Example:

            Stripe     Razorpay     PayPal
            Paytm      ...

          */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <GatewayCard
              name="Stripe"
              gateway="stripe"
              settings={
                settings.paymentGateways.stripe
              }
              onChange={handleGatewayChange}
            />

            <GatewayCard
              name="Razorpay"
              gateway="razorpay"
              settings={
                settings.paymentGateways.razorpay
              }
              onChange={handleGatewayChange}
            />

            <GatewayCard
              name="PayPal"
              gateway="paypal"
              settings={
                settings.paymentGateways.paypal
              }
              onChange={handleGatewayChange}
            />

            <GatewayCard
              name="Paytm"
              gateway="paytm"
              settings={
                settings.paymentGateways.paytm
              }
              onChange={handleGatewayChange}
            />

          </div>

        </SettingsSection>


        {/* =====================================================
            Save Button
        ===================================================== */}

        <div className="flex justify-end">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Save className="h-4 w-4" />

            {saving
              ? 'Saving...'
              : 'Save Platform Settings'}

          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   Settings Section
========================================================= */

function SettingsSection({
  title,
  description,
  icon,
  children,
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">

        <div className="min-w-0">

          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {description}
          </p>

        </div>

        <div className="shrink-0">
          {icon}
        </div>

      </div>

      {/* Content */}

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   Input Field
========================================================= */

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}) {
  return (
    <div className="min-w-0">

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />

    </div>
  );
}


/* =========================================================
   Select Field
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="min-w-0">

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >

        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}

      </select>

    </div>
  );
}


/* =========================================================
   Toggle Row
========================================================= */

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">

      {/* Text */}

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
          {description}
        </p>

      </div>


      {/* Custom Toggle */}

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled
            ? 'bg-indigo-600'
            : 'bg-gray-300'
        }`}
      >

        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
            enabled
              ? 'translate-x-5'
              : 'translate-x-0'
          }`}
        />

      </button>

    </div>
  );
}


/* =========================================================
   Payment Gateway Card
========================================================= */

function GatewayCard({
  name,
  gateway,
  settings,
  onChange,
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-200 hover:border-gray-300 hover:shadow-sm">

      {/* =====================================================
          Gateway Header
      ===================================================== */}

      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">

        <div className="flex items-center justify-between gap-3">

          {/* Gateway Name */}

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">

              <CreditCard className="h-4 w-4 text-gray-600" />

            </div>

            <p className="truncate text-sm font-semibold text-gray-900">
              {name}
            </p>

          </div>


          {/* Enable Toggle */}

          <GatewayToggle
            enabled={settings.enabled}
            onChange={(value) =>
              onChange(
                gateway,
                'enabled',
                value
              )
            }
            label={`Enable ${name}`}
          />

        </div>


        {/* Status */}

        <div className="mt-3">

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
              settings.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {settings.enabled
              ? 'Enabled'
              : 'Disabled'}
          </span>

        </div>

      </div>


      {/* =====================================================
          Gateway Body
      ===================================================== */}

      <div className="flex-1 p-4">

        <div className="grid grid-cols-1 gap-4">

          {/* Environment */}

          <EnvironmentRadio
            gateway={gateway}
            value={settings.environment}
            onChange={(value) =>
              onChange(
                gateway,
                'environment',
                value
              )
            }
          />


          {/* Credentials */}

          {renderCredentialFields(
            gateway,
            settings,
            onChange
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   Gateway Toggle
========================================================= */

function GatewayToggle({
  enabled,
  onChange,
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled
          ? 'bg-indigo-600'
          : 'bg-gray-300'
      }`}
    >

      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled
            ? 'translate-x-5'
            : 'translate-x-0'
        }`}
      />

    </button>
  );
}


/* =========================================================
   Environment Radio Button
========================================================= */

function EnvironmentRadio({
  gateway,
  value,
  onChange,
}) {
  const options =
    gateway === 'paypal'
      ? [
          {
            value: 'sandbox',
            label: 'Sandbox',
          },
          {
            value: 'live',
            label: 'Live',
          },
        ]
      : [
          {
            value: 'test',
            label: 'Test',
          },
          {
            value: 'live',
            label: 'Live',
          },
        ];

  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-gray-700">
        Environment
      </label>

      <div className="flex flex-wrap items-center gap-4">

        {options.map((option) => {

          const isSelected =
            value === option.value;

          const isLive =
            option.value === 'live';

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition ${
                isSelected
                  ? isLive
                    ? 'border-green-300 bg-green-50'
                    : 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >

              {/* Actual Radio */}

              <input
                type="radio"
                name={`${gateway}-environment`}
                value={option.value}
                checked={isSelected}
                onChange={() =>
                  onChange(option.value)
                }
                className="sr-only"
              />


              {/* Custom Radio */}

              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? isLive
                      ? 'border-green-600'
                      : 'border-indigo-600'
                    : 'border-gray-300'
                }`}
              >

                {isSelected && (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isLive
                        ? 'bg-green-600'
                        : 'bg-indigo-600'
                    }`}
                  />
                )}

              </span>


              {/* Label */}

              <span
                className={`text-xs font-semibold sm:text-sm ${
                  isSelected
                    ? isLive
                      ? 'text-green-700'
                      : 'text-indigo-700'
                    : 'text-gray-600'
                }`}
              >
                {option.label}
              </span>

            </label>
          );
        })}

      </div>


      {/* Description */}

      <p className="mt-2 text-[11px] leading-4 text-gray-500">

        {value === 'live'
          ? 'Live payments are enabled.'
          : gateway === 'paypal'
            ? 'Sandbox mode is enabled for testing.'
            : 'Test mode is enabled for testing.'}

      </p>

    </div>
  );
}


/* =========================================================
   Gateway Credential Fields
========================================================= */

function renderCredentialFields(
  gateway,
  settings,
  onChange
) {
  const field = (
    label,
    key,
    type = 'text',
    placeholder = ''
  ) => (
    <InputField
      label={label}
      type={type}
      value={settings[key] || ''}
      onChange={(value) =>
        onChange(
          gateway,
          key,
          value
        )
      }
      placeholder={placeholder}
    />
  );

  switch (gateway) {

    /* =====================================================
       Stripe
    ===================================================== */

    case 'stripe':
      return (
        <>
          {field(
            'Public Key',
            'publicKey',
            'text',
            'pk_test_...'
          )}

          {field(
            'Secret Key',
            'secretKey',
            'password',
            'sk_test_...'
          )}

          {field(
            'Webhook Secret',
            'webhookSecret',
            'password',
            'whsec_...'
          )}
        </>
      );


    /* =====================================================
       Razorpay
    ===================================================== */

    case 'razorpay':
      return (
        <>
          {field(
            'Key ID',
            'keyId',
            'text',
            'rzp_test_...'
          )}

          {field(
            'Key Secret',
            'keySecret',
            'password',
            'Razorpay secret'
          )}

          {field(
            'Webhook Secret',
            'webhookSecret',
            'password',
            'Webhook secret'
          )}
        </>
      );


    /* =====================================================
       PayPal
    ===================================================== */

    case 'paypal':
      return (
        <>
          {field(
            'Client ID',
            'clientId',
            'text',
            'PayPal Client ID'
          )}

          {field(
            'Client Secret',
            'clientSecret',
            'password',
            'PayPal Client Secret'
          )}

          {field(
            'Webhook Secret',
            'webhookSecret',
            'password',
            'Webhook Secret'
          )}
        </>
      );


    /* =====================================================
       Paytm
    ===================================================== */

    case 'paytm':
      return (
        <>
          {field(
            'Merchant ID',
            'merchantId',
            'text',
            'Paytm Merchant ID'
          )}

          {field(
            'Merchant Key',
            'merchantKey',
            'password',
            'Paytm Merchant Key'
          )}

          {field(
            'Website',
            'website',
            'text',
            'WEBSTAGING'
          )}

          {field(
            'Webhook Secret',
            'webhookSecret',
            'password',
            'Webhook Secret'
          )}
        </>
      );


    default:
      return null;
  }
}