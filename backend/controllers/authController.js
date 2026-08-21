const authService = require('../services/authService');

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

    const { user, org, token } = await authService.register({ organizationName, organizationSlug, email, firstName, lastName, password });

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

    const { user, token } = result;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.fullName ? user.fullName.split(' ')[0] : null,
          role: user.roleCode === 'super_admin' ? 'superadmin' : user.roleCode
        },
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
