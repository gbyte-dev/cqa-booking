const express = require('express');
const { v4: uuidv4 } = require('uuid');

const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ===== MIDDLEWARE: CHECK SUPER ADMIN =====
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can access this'
    });
  }
  next();
};

// ===== GET ALL ORGANIZATIONS =====
router.get('/', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📊 [GET /organizations] Fetching all organizations...');

    const organizations = await Organization.findAll({
      include: [
        {
          association: 'Subscription',
          attributes: ['id', 'plan', 'monthlyPrice', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${organizations.length} organizations`);

    res.json({
      success: true,
      data: organizations,
      count: organizations.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== GET SINGLE ORGANIZATION =====
router.get('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('📋 [GET /organizations/:id] Getting organization:', req.params.id);

    const org = await Organization.findByPk(req.params.id, {
      include: [
        {
          association: 'Subscription',
          attributes: ['id', 'plan', 'monthlyPrice', 'status']
        }
      ]
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    console.log('✅ Organization found:', org.name);

    res.json({
      success: true,
      data: org
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CREATE ORGANIZATION =====
router.post('/', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('➕ [POST /organizations] Creating organization:', req.body);

    const { name, slug, timezone, maxVenues } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Name and slug are required'
      });
    }

    // Check if slug exists
    const existing = await Organization.findOne({ where: { slug } });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    // Create organization
    const orgId = uuidv4();
    const org = await Organization.create({
      id: orgId,
      name,
      slug,
      timezone: timezone || 'UTC',
      maxVenues: maxVenues || 1,
      subscriptionStatus: 'active'
    });

    // Create default subscription
    await Subscription.create({
      id: uuidv4(),
      organizationId: orgId,
      plan: 'starter',
      monthlyPrice: 200,
      maxVenues: 1,
      maxStaff: 5,
      maxBookingsPerDay: 50,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true
    });

    console.log('✅ Organization created:', org.id);

    // Fetch with subscription
    const createdOrg = await Organization.findByPk(orgId, {
      include: ['Subscription']
    });

    res.json({
      success: true,
      data: createdOrg,
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== UPDATE ORGANIZATION =====
router.patch('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✏️ [PATCH /organizations/:id] Updating organization:', req.params.id);

    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check if trying to update slug to existing one
    if (req.body.slug && req.body.slug !== org.slug) {
      const existing = await Organization.findOne({
        where: { slug: req.body.slug }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Slug already exists'
        });
      }
    }

    await org.update(req.body);

    console.log('✅ Organization updated:', org.id);

    res.json({
      success: true,
      data: org,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== DELETE ORGANIZATION =====
router.delete('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🗑️ [DELETE /organizations/:id] Deleting organization:', req.params.id);

    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Delete related subscriptions first
    await Subscription.destroy({
      where: { organizationId: org.id }
    });

    await org.destroy();

    console.log('✅ Organization deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== SUSPEND ORGANIZATION =====
router.post('/:id/suspend', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🔒 [POST /organizations/:id/suspend] Suspending organization:', req.params.id);

    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await org.update({ subscriptionStatus: 'suspended' });

    console.log('✅ Organization suspended:', org.id);

    res.json({
      success: true,
      data: org,
      message: 'Organization suspended successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== REACTIVATE ORGANIZATION =====
router.post('/:id/reactivate', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    console.log('✅ [POST /organizations/:id/reactivate] Reactivating organization:', req.params.id);

    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await org.update({ subscriptionStatus: 'active' });

    console.log('✅ Organization reactivated:', org.id);

    res.json({
      success: true,
      data: org,
      message: 'Organization reactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;