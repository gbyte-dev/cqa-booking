const organizationService = require('../services/organizationService');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const toApiShape = (tenant) => {
  if (!tenant) return null;
  const plain = tenant.toJSON ? tenant.toJSON() : tenant;
  return {
    ...plain,
    timezone: 'UTC',
    maxVenues: null,
    subscriptionStatus: plain.isActive ? 'active' : 'suspended',
    Subscription: {
      plan: plain.subscriptionTier || 'core',
      monthlyPrice: 0,
      status: plain.isActive ? 'active' : 'suspended'
    }
  };
};

// ===== GET ALL ORGANIZATIONS =====
exports.list = async (req, res) => {
  try {
    console.log('📊 [GET /organizations] Fetching all organizations...');

    const organizations = await organizationService.listAll();
    const data = organizations.map(toApiShape);

    console.log(`✅ Found ${data.length} organizations`);

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET SINGLE ORGANIZATION =====
exports.getOne = async (req, res) => {
  try {
    console.log('📋 [GET /organizations/:id] Getting organization:', req.params.id);

    const org = await organizationService.getById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    console.log('✅ Organization found:', org.name);

    res.json({
      success: true,
      data: toApiShape(org)
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== CREATE ORGANIZATION =====
exports.create = async (req, res) => {
  try {
    console.log('➕ [POST /organizations] Creating organization:', req.body);

    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Name and slug are required'
      });
    }

    const existing = await organizationService.findBySlug(slug);

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    const createdOrg = await organizationService.create({ name, slug });

    console.log('✅ Organization created:', createdOrg.id);

    res.json({
      success: true,
      data: toApiShape(createdOrg),
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== UPDATE ORGANIZATION =====
exports.update = async (req, res) => {
  try {
    console.log('✏️ [PATCH /organizations/:id] Updating organization:', req.params.id);

    const result = await organizationService.update(req.params.id, req.body);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    if (result.slugConflict) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    console.log('✅ Organization updated:', result.org.id);

    res.json({
      success: true,
      data: toApiShape(result.org),
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== DELETE ORGANIZATION =====
exports.remove = async (req, res) => {
  try {
    console.log('🗑️ [DELETE /organizations/:id] Deleting organization:', req.params.id);

    const deleted = await organizationService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

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
};

// ===== SUSPEND ORGANIZATION =====
exports.suspend = async (req, res) => {
  try {
    console.log('🔒 [POST /organizations/:id/suspend] Suspending organization:', req.params.id);

    const org = await organizationService.suspend(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    console.log('✅ Organization suspended:', org.id);

    res.json({
      success: true,
      data: toApiShape(org),
      message: 'Organization suspended successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== REACTIVATE ORGANIZATION =====
exports.reactivate = async (req, res) => {
  try {
    console.log('✅ [POST /organizations/:id/reactivate] Reactivating organization:', req.params.id);

    const org = await organizationService.reactivate(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    console.log('✅ Organization reactivated:', org.id);

    res.json({
      success: true,
      data: toApiShape(org),
      message: 'Organization reactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET MY ORGANIZATION (tenant owner's own view) =====
exports.getMine = async (req, res) => {
  try {
    const org = await organizationService.getById(req.user.organizationId);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const subscription = await Subscription.findOne({
      where: { tenantId: org.id },
      include: [{ model: SubscriptionPlan, as: 'Plan' }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        ...toApiShape(org),
        Subscription: subscription
          ? {
              plan: subscription.Plan?.code || null,
              planName: subscription.Plan?.name || null,
              monthlyPrice: Number(subscription.amount),
              status: subscription.status,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              autoRenew: subscription.autoRenew,
              maxOutlets: subscription.Plan?.maxOutlets ?? null,
              maxUsers: subscription.Plan?.maxUsers ?? null,
              maxReservations: subscription.Plan?.maxReservations ?? null
            }
          : null
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
