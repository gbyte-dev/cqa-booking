const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Organization = require('../models/Organization');
const User = require('../models/User');

const router = express.Router();

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const { organizationName, organizationSlug, email, firstName, lastName, password } = req.body;

    // ===== VALIDATION =====
    if (!organizationName || !email || !firstName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // ===== CREATE ORGANIZATION =====
    const org = await Organization.create({
      id: uuidv4(),
      name: organizationName,
      slug: organizationSlug || organizationName.toLowerCase().replace(/\s/g, '-'),
      timezone: 'UTC'
    });

    // ===== HASH PASSWORD =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== CREATE USER =====
    const user = await User.create({
      id: uuidv4(),
      organizationId: org.id,
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      role: 'admin'
    });

    // ===== GENERATE TOKEN =====
    const token = jwt.sign(
      { userId: user.id, organizationId: org.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role
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
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // ===== FIND USER =====
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // ===== VERIFY PASSWORD =====
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // ===== GENERATE TOKEN =====
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role
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
});

router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const response = { success: true, message: 'If the account exists, password reset instructions have been generated' };
  if (!user) return res.json(response);
  const token = crypto.randomBytes(32).toString('hex');
  await user.update({ passwordResetToken: token, passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) });
  if (process.env.NODE_ENV !== 'production') response.developmentToken = token;
  res.json(response);
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) return res.status(400).json({ success: false, error: 'Token and password of at least 8 characters are required' });
  const user = await User.findOne({ where: { passwordResetToken: token } });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) return res.status(400).json({ success: false, error: 'Reset token is invalid or expired' });
  await user.update({ passwordHash: await bcrypt.hash(password, 12), passwordResetToken: null, passwordResetExpires: null });
  res.json({ success: true, message: 'Password reset successfully' });
});

module.exports = router;