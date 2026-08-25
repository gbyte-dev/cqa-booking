'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const mailService = require('./mailService');

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

// ==========================================================
// CREATE + SEND VERIFICATION
// ==========================================================

exports.createAndSendToken = async ({ user }) => {
  if (!user || !user.id || !user.email) {
    throw new Error('Invalid user data for email verification.');
  }

  const email = normalizeEmail(user.email);

  /*
   * Remove all previous unused tokens.
   * This means only the latest verification link is valid.
   */
  await EmailVerificationToken.destroy({
    where: {
      userId: user.id,
      verifiedAt: null
    }
  });

  /*
   * Generate cryptographically secure random token.
   */
  const rawToken = crypto.randomBytes(32).toString('hex');

  /*
   * NEVER store raw token in DB.
   */
  const tokenHash = hashToken(rawToken);

  const now = new Date();

  await EmailVerificationToken.create({
    id: uuidv4(),
    userId: user.id,
    email,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    verifiedAt: null,
    createdAt: now,
    updatedAt: now
  });

  const verifyUrl =
    `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;

  try {
    await mailService.sendVerificationEmail({
      toEmail: email,
      fullName: user.fullName,
      verifyUrl
    });

    return {
      sent: true
    };
  } catch (error) {
    console.error(
      '[EMAIL VERIFICATION] Send failed:',
      error
    );

    /*
     * Remove token if email could not be sent.
     * User can request another verification later.
     */
    await EmailVerificationToken.destroy({
      where: {
        tokenHash
      }
    });

    return {
      sent: false,
      error:
        error.message ||
        'Could not send verification email.'
    };
  }
};

// ==========================================================
// VERIFY TOKEN
// ==========================================================

exports.verifyToken = async (rawToken) => {
  if (
    !rawToken ||
    typeof rawToken !== 'string' ||
    rawToken.length < 32
  ) {
    return {
      success: false,
      error: 'Verification link is invalid.'
    };
  }

  const tokenHash = hashToken(rawToken);

  const verificationToken =
    await EmailVerificationToken.findOne({
      where: {
        tokenHash
      }
    });

  if (!verificationToken) {
    return {
      success: false,
      error:
        'This verification link is invalid or has already been used.'
    };
  }

  if (verificationToken.verifiedAt) {
    return {
      success: false,
      error:
        'This verification link has already been used.'
    };
  }

  if (
    !verificationToken.expiresAt ||
    verificationToken.expiresAt.getTime() <= Date.now()
  ) {
    return {
      success: false,
      error:
        'This verification link has expired. Please request a new verification email.'
    };
  }

  /*
   * Verify the user.
   */
  const [updatedRows] = await User.update(
    {
      isEmailVerified: true
    },
    {
      where: {
        id: verificationToken.userId
      }
    }
  );

  if (updatedRows === 0) {
    return {
      success: false,
      error:
        'The account associated with this verification link no longer exists.'
    };
  }

  /*
   * Mark token as consumed.
   */
  await verificationToken.update({
    verifiedAt: new Date(),
    updatedAt: new Date()
  });

  /*
   * Remove any other unused tokens for this user.
   */
  await EmailVerificationToken.destroy({
    where: {
      userId: verificationToken.userId,
      verifiedAt: null
    }
  });

  return {
    success: true,
    message:
      'Your email has been verified successfully.'
  };
};

// ==========================================================
// RESEND
// ==========================================================

exports.resendVerification = async (email) => {
  /*
   * Enumeration-safe response.
   */
  const genericResponse = {
    success: true,
    message:
      'If an account with that email exists and is not yet verified, a new verification email has been sent.'
  };

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return genericResponse;
  }

  const user = await User.findOne({
    where: {
      email: normalizedEmail
    }
  });

  if (!user || user.isEmailVerified) {
    return genericResponse;
  }

  /*
   * IMPORTANT:
   * Sequelize attribute = createdAt
   * DB column = created_at
   */
  const lastToken =
    await EmailVerificationToken.findOne({
      where: {
        userId: user.id
      },
      order: [['createdAt', 'DESC']]
    });

  if (lastToken && lastToken.createdAt) {
    const elapsed =
      Date.now() -
      new Date(lastToken.createdAt).getTime();

    if (elapsed < RESEND_COOLDOWN_MS) {
      const secondsLeft = Math.ceil(
        (RESEND_COOLDOWN_MS - elapsed) / 1000
      );

      return {
        success: false,
        error:
          `Please wait ${secondsLeft}s before requesting another verification email.`,
        cooldown: secondsLeft
      };
    }
  }

  const result =
    await exports.createAndSendToken({ user });

  if (!result.sent) {
    return {
      success: false,
      error:
        result.error ||
        'Could not send verification email. Please try again later.'
    };
  }

  return genericResponse;
};