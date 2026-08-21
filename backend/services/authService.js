const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Organization = require('../models/Organization');
const User = require('../models/User');

const signToken = (user, organizationId) => {
  return jwt.sign(
    { userId: user.id, organizationId, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

exports.register = async ({ organizationName, organizationSlug, email, firstName, lastName, password }) => {
  const org = await Organization.create({
    id: uuidv4(),
    name: organizationName,
    slug: organizationSlug || organizationName.toLowerCase().replace(/\s/g, '-'),
    timezone: 'UTC'
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    id: uuidv4(),
    organizationId: org.id,
    email,
    firstName,
    lastName,
    passwordHash: hashedPassword,
    role: 'admin'
  });

  const token = signToken(user, org.id);

  return { user, org, token };
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

  const token = signToken(user, user.organizationId);

  return { user, token };
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return { found: false };

  const token = crypto.randomBytes(32).toString('hex');
  await user.update({ passwordResetToken: token, passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) });

  return { found: true, token };
};

exports.resetPassword = async (token, password) => {
  const user = await User.findOne({ where: { passwordResetToken: token } });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return { valid: false };
  }

  await user.update({ passwordHash: await bcrypt.hash(password, 12), passwordResetToken: null, passwordResetExpires: null });
  return { valid: true };
};
