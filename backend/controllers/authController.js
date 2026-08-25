const authService = require('../services/authService');
const emailVerificationService = require('../services/emailVerificationService');

// ===== REGISTER =====
exports.register = async (req, res) => {
  try {
    const { organizationName, organizationSlug, email, firstName, lastName, password } = req.body;

    if (!organizationName || !email || !firstName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const result = await authService.register({ organizationName, organizationSlug, email, firstName, lastName, password });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    const { user, org, token } = result;

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.fullName ? user.fullName.split(' ')[0] : null,
          role: user.roleCode === 'super_admin' ? 'superadmin' : user.roleCode
        },
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== LOGIN =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const result = await authService.login({ email, password });

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (result.emailNotVerified) {
      return res.status(403).json({
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
        email: result.email,
      });
    }

    if (result.suspended) {
      return res.status(403).json({
        success: false,
        error: result.reason === 'account'
          ? 'Your account has been suspended. Please contact your organization owner.'
          : 'Your organization has been suspended. Please contact platform support.'
      });
    }

    const { user, org, token } = result;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.fullName ? user.fullName.split(' ')[0] : null,
          role: user.roleCode === 'super_admin' ? 'superadmin' : user.roleCode
        },
        organization: org ? { id: org.id, name: org.name, slug: org.slug } : null,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== FORGOT PASSWORD =====
exports.forgotPassword = async (req, res) => {
  const response = { success: true, message: 'If the account exists, password reset instructions have been generated' };

  const result = await authService.forgotPassword(req.body.email);
  if (!result.found) return res.json(response);

  if (process.env.NODE_ENV !== 'production') response.developmentToken = result.token;
  res.json(response);
};

// ===== RESET PASSWORD =====
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Token and password of at least 8 characters are required' });
  }

  const result = await authService.resetPassword(token, password);
  if (!result.valid) {
    return res.status(400).json({ success: false, error: 'Reset token is invalid or expired' });
  }

  res.json({ success: true, message: 'Password reset successfully' });
};

// ===== REGISTER CUSTOMER =====
exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    const result = await authService.registerCustomer({ fullName, email, phone, password });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const { user, emailWarning } = result;

    res.status(201).json({
      success: true,
      data: {
        needsVerification: true,
        email: user.email,
        warning: emailWarning
          ? "Your account was created, but we couldn't send the verification email right now. Please try sending the verification email again."
          : null
      }
    });
  } catch (error) {
    console.error('Register customer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== OWNER REGISTRATION: VALIDATE STEP =====
exports.validateOwnerRegistration = async (req, res) => {
  try {
    const { email, slug } = req.body;
    const result = await authService.validateOwnerRegistration({ email, slug });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Validate owner registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== OWNER REGISTRATION: LIST ENABLED PAYMENT GATEWAYS =====
exports.getOwnerPaymentGateways = async (req, res) => {
  try {
    const gateways = await authService.getOwnerPaymentGateways();
    res.json({ success: true, data: gateways });
  } catch (error) {
    console.error('List owner payment gateways error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== OWNER REGISTRATION: START CHECKOUT =====
exports.createOwnerPaymentIntent = async (req, res) => {
  try {
    const { owner, business, outlet, planId, provider } = req.body;

    if (!owner?.fullName || !owner?.email || !owner?.password) {
      return res.status(400).json({ success: false, error: 'Owner details are incomplete' });
    }
    if (owner.password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
    }
    if (!business?.name || !business?.slug) {
      return res.status(400).json({ success: false, error: 'Business details are incomplete' });
    }
    if (!outlet?.name) {
      return res.status(400).json({ success: false, error: 'Outlet details are incomplete' });
    }
    if (!planId) {
      return res.status(400).json({ success: false, error: 'A subscription plan is required' });
    }

    const result = await authService.createOwnerPaymentIntent({ owner, business, outlet, planId, provider });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    if (!result.requiresPayment) {
      const { user, org, emailWarning } = result;
      return res.status(201).json({
        success: true,
        data: {
          needsVerification: true,
          email: user.email,
          organization: { id: org.id, name: org.name, slug: org.slug },
          warning: emailWarning
            ? "Your account was created, but we couldn't send the verification email right now. Please try sending the verification email again."
            : null
        }
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Create owner payment intent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== OWNER REGISTRATION: CONFIRM PAYMENT =====
exports.confirmOwnerPayment = async (req, res) => {
  try {
    const { reference, provider, ...fields } = req.body;

    if (!reference || !provider) {
      return res.status(400).json({ success: false, error: 'reference and provider are required' });
    }

    const result = await authService.confirmOwnerPayment({ reference, provider, ...fields });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const { user, org, emailWarning } = result;

    res.status(201).json({
      success: true,
      data: {
        needsVerification: true,
        email: user.email,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug
        },
        warning: emailWarning
          ? "Your account was created, but we couldn't send the verification email right now. Please try sending the verification email again."
          : null
      }
    });
  } catch (error) {
    console.error('Confirm owner payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================================
// VERIFY EMAIL
// POST /api/v1/auth/verify-email
// ==========================================================

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required.'
      });
    }

    const result =
      await emailVerificationService.verifyToken(
        token
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      '[VERIFY EMAIL CONTROLLER ERROR]',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Unable to verify your email right now. Please try again later.'
    });
  }
};

// ==========================================================
// RESEND VERIFICATION
// POST /api/v1/auth/resend-verification
// ==========================================================

exports.resendVerification = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.'
      });
    }

    const result =
      await emailVerificationService
        .resendVerification(email);

    if (!result.success) {
      return res.status(429).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      '[RESEND VERIFICATION CONTROLLER ERROR]',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Unable to resend verification email right now.'
    });
  }
};