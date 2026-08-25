// Blocks tenant-side users (owner/manager/staff) from protected tenant APIs
// until their email is verified. Must run AFTER authMiddleware (needs req.user).
// Customers and super_admin are intentionally exempt — customers get a
// non-blocking warning banner instead, and super_admin never carries this flag.
const TENANT_ROLES = ['owner', 'manager', 'staff'];

const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  if (TENANT_ROLES.includes(req.user.role) && !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before accessing this resource.',
      email: req.user.email
    });
  }

  next();
};

module.exports = requireVerifiedEmail;
