const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Role = require('../models/Role');
const GuestProfile = require('../models/GuestProfile');
const Outlet = require('../models/Outlet');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const platformSettingsService = require('./platformSettingsService');
const { getAdapter } = require('./paymentGateways');

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

  // Block login for a suspended individual account (Manager/Staff suspended
  // by the Owner) — separate from the tenant-level suspension check below.
  if (!user.isActive) {
    return { suspended: true, reason: 'account' };
  }

  // Block login for tenant-side users (owner/staff/manager) whose organization
  // is suspended. super_admin is a platform-level role and must never be
  // blocked by a tenant's status, even if its user row happens to carry a
  // tenantId from legacy data.
  let tenant = null;
  if (user.tenantId && user.roleCode !== 'super_admin') {
    tenant = await Tenant.findByPk(user.tenantId);
    if (tenant && !tenant.isActive) {
      return { suspended: true };
    }
  }

  const token = signToken(user);

  return { user, org: tenant, token };
};

exports.forgotPassword = async () => {
  // NOTE: the new `users` table has no password_reset_token/expires columns.
  // Feature disabled until those columns are added via a follow-up migration.
  return { found: false };
};

exports.resetPassword = async () => {
  return { valid: false };
};

// ===== CUSTOMER REGISTRATION =====
exports.registerCustomer = async ({ fullName, email, phone, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return { error: 'An account with this email already exists' };
  }

  const customerRole = await Role.findOne({ where: { code: 'customer' } });
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    id: uuidv4(),
    email,
    phone: phone || null,
    passwordHash: hashedPassword,
    fullName,
    tenantId: null,
    outletId: null,
    roleId: customerRole ? customerRole.id : null,
    roleCode: 'customer'
  });

  await GuestProfile.create({
    id: uuidv4(),
    tenantId: null,
    userId: user.id,
    fullName,
    email,
    phone: phone || null
  });

  const token = signToken(user);

  return { user, token };
};

// ===== OWNER REGISTRATION: STEP VALIDATION (email + slug availability) =====
exports.validateOwnerRegistration = async ({ email, slug }) => {
  const errors = {};

  if (email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) errors.email = 'An account with this email already exists';
  }

  if (slug) {
    const existingTenant = await Tenant.findOne({ where: { slug } });
    if (existingTenant) errors.slug = 'This business slug is already taken';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

// If an abandoned checkout left a pending (never-activated) tenant/user behind
// under this email or slug, delete it — otherwise an abandoned checkout would
// permanently lock that email/slug from ever registering again. Only rows that
// are BOTH inactive AND still 'pending' are touched — a legitimately suspended
// paying tenant is never affected.
async function reclaimStalePendingRegistration({ email, slug }) {
  const tenantIds = new Set();

  if (email) {
    const staleUser = await User.findOne({ where: { email } });
    if (staleUser?.tenantId) tenantIds.add(staleUser.tenantId);
  }
  if (slug) {
    const staleTenant = await Tenant.findOne({ where: { slug } });
    if (staleTenant) tenantIds.add(staleTenant.id);
  }

  for (const tenantId of tenantIds) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant || tenant.isActive) continue;

    const pendingSub = await Subscription.findOne({ where: { tenantId: tenant.id, status: 'pending' } });
    if (!pendingSub) continue;

    await Subscription.destroy({ where: { tenantId: tenant.id } });
    await User.destroy({ where: { tenantId: tenant.id } });
    await Outlet.destroy({ where: { tenantId: tenant.id } });
    await tenant.destroy();
  }
}

async function createTenantStack({ owner, business, outlet, plan, status, tenantActive }) {
  const transaction = await sequelize.transaction();

  try {
    const tenant = await Tenant.create({
      id: uuidv4(),
      name: business.name,
      slug: business.slug,
      subscriptionTier: plan.code,
      isActive: tenantActive
    }, { transaction });

    const createdOutlet = await Outlet.create({
      id: uuidv4(),
      tenantId: tenant.id,
      name: outlet.name,
      slug: business.slug,
      venueType: outlet.venueType || null,
      currency: outlet.currency || plan.currency || 'USD',
      timezone: outlet.timezone || 'UTC',
      contactEmail: outlet.contactEmail || null,
      contactPhone: outlet.contactPhone || null,
      address: outlet.address || null
    }, { transaction });

    const ownerRole = await Role.findOne({ where: { code: 'owner' } });
    const hashedPassword = await bcrypt.hash(owner.password, 10);

    const user = await User.create({
      id: uuidv4(),
      email: owner.email,
      phone: owner.phone || null,
      passwordHash: hashedPassword,
      fullName: owner.fullName,
      tenantId: tenant.id,
      outletId: createdOutlet.id,
      roleId: ownerRole ? ownerRole.id : null,
      roleCode: 'owner'
    }, { transaction });

    const subscription = await Subscription.create({
      id: uuidv4(),
      tenantId: tenant.id,
      planId: plan.id,
      status,
      startDate: new Date(),
      amount: plan.price,
      currency: plan.currency || 'USD',
      autoRenew: true,
      paymentProvider: status === 'active' ? 'none' : null
    }, { transaction });

    await transaction.commit();
    return { tenant, outlet: createdOutlet, user, subscription };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// Shared by the frontend's explicit confirm call AND the webhook handler —
// must be idempotent since both can race to activate the same subscription.
async function activateSubscription(subscriptionId, { externalId } = {}) {
  const subscription = await Subscription.findByPk(subscriptionId);
  if (!subscription) return { error: 'Subscription not found' };

  const tenant = await Tenant.findByPk(subscription.tenantId);
  const user = await User.findOne({ where: { tenantId: subscription.tenantId, roleCode: 'owner' } });
  if (!tenant || !user) return { error: 'Registration record not found' };

  if (subscription.status === 'active') {
    return { user, tenant, subscription, alreadyActive: true };
  }

  await subscription.update({ status: 'active', externalSubscriptionId: externalId || subscription.externalSubscriptionId });
  await tenant.update({ isActive: true });

  return { user, tenant, subscription };
}

// ===== OWNER REGISTRATION: LIST ENABLED PAYMENT GATEWAYS (public, no secrets) =====
exports.getOwnerPaymentGateways = async () => {
  return platformSettingsService.getPublicEnabledGateways();
};

// ===== OWNER REGISTRATION: START CHECKOUT =====
// Free plan: creates everything active immediately, no gateway involved.
// Paid plan: creates a PENDING tenant/outlet/user/subscription up front, then
// starts a real order/intent with the chosen gateway. Nothing is marked active
// until the payment is verified — see confirmOwnerPayment / handlePaymentWebhook.
exports.createOwnerPaymentIntent = async ({ owner, business, outlet, planId, provider }) => {
  if (!owner?.email || !business?.slug) {
    return { error: 'Owner and business details are required' };
  }

  await reclaimStalePendingRegistration({ email: owner.email, slug: business.slug });

  const existingUser = await User.findOne({ where: { email: owner.email } });
  if (existingUser) {
    return { error: 'An account with this email already exists' };
  }

  const existingTenant = await Tenant.findOne({ where: { slug: business.slug } });
  if (existingTenant) {
    return { error: 'This business slug is already taken' };
  }

  const plan = await SubscriptionPlan.findOne({ where: { id: planId, isActive: true } });
  if (!plan) {
    return { error: 'Selected plan is not available' };
  }

  const isFreePlan = Number(plan.price) <= 0;

  if (isFreePlan) {
    const { tenant, user } = await createTenantStack({ owner, business, outlet, plan, status: 'active', tenantActive: true });
    const token = signToken(user);
    return { requiresPayment: false, user, org: tenant, token };
  }

  if (!provider) {
    return { error: 'A payment method is required for this plan' };
  }

  const gatewayConfig = await platformSettingsService.getDecryptedGateway(provider);
  if (!gatewayConfig?.enabled) {
    return { error: 'The selected payment method is not available' };
  }

  const { tenant, subscription } = await createTenantStack({ owner, business, outlet, plan, status: 'pending', tenantActive: false });

  let providerPayload;
  console.log('\n========== PAYMENT INTENT DEBUG ==========');
  console.log('Provider:', provider);
  console.log('SETTINGS_ENCRYPTION_KEY exists:', !!process.env.SETTINGS_ENCRYPTION_KEY);
  console.log('SETTINGS_ENCRYPTION_KEY length:', process.env.SETTINGS_ENCRYPTION_KEY?.length);
  try {
    const adapter = getAdapter(provider);
    providerPayload = await adapter.createOrder({
      config: gatewayConfig,
      amount: plan.price,
      currency: plan.currency || 'USD',
      reference: subscription.id,
      description: `Aventa Core — ${plan.name} subscription for ${business.name}`
    });
  } catch (err) {
    // Gateway order creation failed — undo the pending rows so this isn't an
    // orphaned registration with no way to ever pay for it.
    await Subscription.destroy({ where: { tenantId: tenant.id } });
    await User.destroy({ where: { tenantId: tenant.id } });
    await Outlet.destroy({ where: { tenantId: tenant.id } });
    await tenant.destroy();
    return { error: err.message || 'Could not start payment' };
  }

  const externalId = providerPayload.paymentIntentId || providerPayload.orderId || null;
  await subscription.update({ paymentProvider: provider, externalSubscriptionId: externalId });

  return { requiresPayment: true, provider, reference: subscription.id, ...providerPayload };
};

// ===== OWNER REGISTRATION: CONFIRM PAYMENT (called by the frontend right after checkout) =====
exports.confirmOwnerPayment = async ({ reference, provider, ...fields }) => {
  const subscription = await Subscription.findByPk(reference);
  if (!subscription) {
    return { error: 'Registration session not found or has expired' };
  }

  if (subscription.status === 'active') {
    const tenant = await Tenant.findByPk(subscription.tenantId);
    const user = await User.findOne({ where: { tenantId: subscription.tenantId, roleCode: 'owner' } });
    return { user, org: tenant, token: signToken(user) };
  }

  const gatewayConfig = await platformSettingsService.getDecryptedGateway(provider);
  if (!gatewayConfig?.enabled) {
    return { error: 'The selected payment method is not available' };
  }

  const plan = await SubscriptionPlan.findByPk(subscription.planId);
  const adapter = getAdapter(provider);

  const result = await adapter.verify({
    config: gatewayConfig,
    reference: subscription.id,
    expectedAmount: plan?.price,
    ...fields
  });

  if (!result.verified) {
    return { error: 'Payment has not been completed successfully' };
  }

  const activation = await activateSubscription(subscription.id, { externalId: result.externalId });
  if (activation.error) return activation;

  return { user: activation.user, org: activation.tenant, token: signToken(activation.user) };
};

// ===== PAYMENT WEBHOOKS: idempotent activation from the gateway's own event =====
exports.handlePaymentWebhook = async ({ provider, rawBody, headers }) => {
  const gatewayConfig = await platformSettingsService.getDecryptedGateway(provider);
  if (!gatewayConfig?.webhookSecret) {
    throw new Error('Webhook is not configured for this provider');
  }

  const adapter = getAdapter(provider);
  const result = await adapter.verifyWebhook({ config: gatewayConfig, rawBody, headers });

  if (!result.verified || !result.externalId) {
    return { handled: false };
  }

  let subscription = await Subscription.findOne({ where: { externalSubscriptionId: result.externalId } });
  if (!subscription && result.reference) {
    subscription = await Subscription.findByPk(result.reference);
  }
  if (!subscription) {
    return { handled: false };
  }

  await activateSubscription(subscription.id, { externalId: result.externalId });
  return { handled: true };
};
