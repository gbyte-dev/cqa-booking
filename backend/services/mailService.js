'use strict';

const nodemailer = require('nodemailer');
const platformSettingsService =
  require('./platformSettingsService');

async function getTransporter() {
  const config =
    await platformSettingsService.getDecryptedSmtp();

  if (
    !config ||
    !config.host ||
    !config.username ||
    !config.password
  ) {
    const error =
      new Error('SMTP is not configured.');

    error.code = 'SMTP_NOT_CONFIGURED';

    throw error;
  }

  const port =
    Number(config.port) || 587;

  /*
   * encryption: 'ssl' => implicit TLS from the start of the connection
   *             'tls' => plaintext connection, upgraded via STARTTLS
   *             'none' => no encryption
   */
  const secure = config.encryption === 'ssl';
  const requireTLS = config.encryption === 'tls';

  const transporter =
    nodemailer.createTransport({
      host: config.host,
      port,
      secure,
      requireTLS,
      auth: {
        user: config.username,
        pass: config.password
      }
    });

  return {
    transporter,
    config
  };
}

// ==========================================================
// SEND MAIL
// ==========================================================

async function sendMail({
  to,
  subject,
  html,
  text
}) {
  let transporter;
  let config;

  try {
    ({
      transporter,
      config
    } = await getTransporter());
  } catch (error) {
    if (
      error.code ===
      'SMTP_NOT_CONFIGURED'
    ) {
      throw new Error(
        'Email could not be sent because SMTP is not configured. Please contact the platform administrator.'
      );
    }

    console.error(
      '[MAIL CONFIG ERROR]',
      error
    );

    throw new Error(
      'Email could not be sent due to a mail configuration error.'
    );
  }

  const fromName =
    config.fromName ||
    'CQA Booking Platform';

  const fromEmail =
    config.fromEmail ||
    config.username;

  try {
    await transporter.sendMail({
      from:
        `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text
    });
  } catch (error) {
    console.error(
      '[SMTP SEND ERROR]',
      error
    );

    throw new Error(
      'Could not send email. Please check the SMTP configuration.'
    );
  }
}

// ==========================================================
// TEST SMTP
// ==========================================================

exports.sendTestEmail = async (toEmail) => {
  let transporter;
  let config;

  try {
    ({
      transporter,
      config
    } = await getTransporter());

    await transporter.verify();
  } catch (error) {
    console.error(
      '[SMTP VERIFY ERROR]',
      error
    );

    throw new Error(
      'Could not connect to the SMTP server. Please check host, port and SMTP credentials.'
    );
  }

  const fromName =
    config.fromName ||
    'CQA Booking Platform';

  const fromEmail =
    config.fromEmail ||
    config.username;

  try {
    await transporter.sendMail({
      from:
        `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject:
        'SMTP Test — CQA Booking Platform',
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px;">
          <h2>SMTP Configuration Successful</h2>
          <p>Your CQA Booking Platform SMTP configuration is working correctly.</p>
        </div>
      `,
      text:
        'Your CQA Booking Platform SMTP configuration is working correctly.'
    });
  } catch (error) {
    console.error(
      '[SMTP TEST SEND ERROR]',
      error
    );

    throw new Error(
      'SMTP connection succeeded, but the test email could not be sent.'
    );
  }
};

// ==========================================================
// VERIFICATION EMAIL
// ==========================================================

exports.sendVerificationEmail = async ({
  toEmail,
  fullName,
  verifyUrl
}) => {
  const safeName =
    fullName
      ? String(fullName)
          .trim()
          .split(/\s+/)[0]
      : 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center" style="padding:40px 15px;">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
    max-width:560px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #e5e7eb;
  "
>

<tr>
<td
  style="
    padding:30px;
    background:linear-gradient(135deg,#667eea,#764ba2);
  "
>
  <div
    style="
      color:#ffffff;
      font-size:18px;
      font-weight:800;
      letter-spacing:1px;
    "
  >
    CQA BOOKING PLATFORM
  </div>
</td>
</tr>

<tr>
<td style="padding:38px 32px;">

<h1
  style="
    margin:0 0 16px;
    color:#111827;
    font-size:24px;
  "
>
  Verify your email address
</h1>

<p
  style="
    margin:0 0 12px;
    color:#374151;
    font-size:15px;
    line-height:1.7;
  "
>
  Hi ${safeName},
</p>

<p
  style="
    margin:0 0 25px;
    color:#4b5563;
    font-size:14px;
    line-height:1.7;
  "
>
  Thank you for registering with CQA Booking Platform.
  Please verify your email address to activate your account.
</p>

<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td
  style="
    border-radius:10px;
    background:linear-gradient(135deg,#667eea,#764ba2);
  "
>
<a
  href="${verifyUrl}"
  style="
    display:inline-block;
    padding:14px 26px;
    color:#ffffff;
    text-decoration:none;
    font-size:14px;
    font-weight:700;
    border-radius:10px;
  "
>
  Verify Email Address
</a>
</td>
</tr>
</table>

<p
  style="
    margin:26px 0 0;
    color:#6b7280;
    font-size:12px;
    line-height:1.6;
  "
>
  This verification link will expire in 24 hours.
</p>

<p
  style="
    margin:18px 0 0;
    color:#6b7280;
    font-size:12px;
    line-height:1.6;
  "
>
  If the button does not work, copy and paste this link into your browser:
</p>

<p
  style="
    margin:8px 0 0;
    color:#4f46e5;
    font-size:11px;
    line-height:1.6;
    word-break:break-all;
  "
>
  ${verifyUrl}
</p>

<p
  style="
    margin:25px 0 0;
    color:#9ca3af;
    font-size:11px;
    line-height:1.6;
  "
>
  If you did not create this account, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
  style="
    padding:20px 32px;
    background:#f9fafb;
    border-top:1px solid #e5e7eb;
  "
>
<p
  style="
    margin:0;
    color:#9ca3af;
    font-size:11px;
  "
>
© ${new Date().getFullYear()} CQA Booking Platform.
All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  const text = `
Hi ${safeName},

Thank you for registering with CQA Booking Platform.

Please verify your email address by opening this link:

${verifyUrl}

This link expires in 24 hours.

If you did not create this account, you can safely ignore this email.
`;

  await sendMail({
    to: toEmail,
    subject:
      'Verify Your Email — CQA Booking Platform',
    html,
    text
  });
};

module.exports = exports;