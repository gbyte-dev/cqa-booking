const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Role = require('../models/Role');

const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, organizationId: user.tenantId, role: user.roleCode },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

exports.register = async ({ organizationName, organizationSlug, email, firstName, lastName, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return { error: 'An account with this email already exists' };
  }

  const tenant = await Tenant.create({
    id: uuidv4(),
    name: organizationName,
    slug: organizationSlug || organizationName.toLowerCase().replace(/\s/g, '-'),
    subscriptionTier: 'CORE',
    isActive: true
  });

  const ownerRole = await Role.findOne({ where: { code: 'owner' } });
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    id: uuidv4(),
    email,
    passwordHash: hashedPassword,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    tenantId: tenant.id,
    roleId: ownerRole ? ownerRole.id : null,
    roleCode: 'owner'
  });

  const token = signToken(user);

  return { user, org: tenant, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  // Block login for tenant-side users (owner/staff/manager) whose organization
  // is suspended. super_admin is a platform-level role and must never be
  // blocked by a tenant's status, even if its user row happens to carry a
  // tenantId from legacy data.
  if (user.tenantId && user.roleCode !== 'super_admin') {
    const tenant = await Tenant.findByPk(user.tenantId);
    if (tenant && !tenant.isActive) {
      return { suspended: true };
    }
  }

  const token = signToken(user);

  return { user, token };
};

exports.forgotPassword = async () => {
  // NOTE: the new `users` table has no password_reset_token/expires columns.
  // Feature disabled until those columns are added via a follow-up migration.
  return { found: false };
};

exports.resetPassword = async () => {
  return { valid: false };
};
