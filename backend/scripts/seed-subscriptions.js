// One-off script: seeds subscription_plans and creates a real `subscriptions` row
// for every existing tenant (derived from tenants.subscription_tier + is_active),
// so the new subscriptions/subscription_plans tables have real data instead of
// the old virtual/derived objects superAdminService used to fabricate.
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');
const Tenant = require('../models/Tenant');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');

const PLANS = [
  { code: 'starter', name: 'Starter', price: 200, maxOutlets: 1, maxUsers: 5, maxReservations: 50 },
  { code: 'professional', name: 'Professional', price: 500, maxOutlets: 5, maxUsers: 20, maxReservations: 200 },
  { code: 'enterprise', name: 'Enterprise', price: 2000, maxOutlets: 999, maxUsers: 999, maxReservations: 9999 },
  { code: 'core', name: 'Core', price: 0, maxOutlets: 1, maxUsers: 5, maxReservations: 100 }
];

async function run() {
  await sequelize.authenticate();
  console.log('Connected. Seeding subscription plans...');

  const planByCode = {};
  for (const p of PLANS) {
    const [plan] = await SubscriptionPlan.findOrCreate({
      where: { code: p.code },
      defaults: {
        id: uuidv4(),
        name: p.name,
        code: p.code,
        price: p.price,
        billingCycle: 'monthly',
        currency: 'USD',
        maxOutlets: p.maxOutlets,
        maxUsers: p.maxUsers,
        maxReservations: p.maxReservations,
        isActive: true
      }
    });
    planByCode[p.code] = plan;
    console.log(`  plan ready: ${p.code} -> ${plan.id}`);
  }

  const tenants = await Tenant.findAll();
  console.log(`Found ${tenants.length} tenants. Creating subscription rows...`);

  let created = 0;
  for (const tenant of tenants) {
    const existing = await Subscription.findOne({ where: { tenantId: tenant.id } });
    if (existing) continue;

    const tierCode = (tenant.subscriptionTier || 'starter').toLowerCase();
    const plan = planByCode[tierCode] || planByCode.starter;

    await Subscription.create({
      id: uuidv4(),
      tenantId: tenant.id,
      planId: plan.id,
      status: tenant.isActive ? 'active' : 'cancelled',
      startDate: tenant.created_at || new Date(),
      endDate: null,
      autoRenew: true,
      amount: plan.price,
      currency: 'USD',
      cancelledAt: tenant.isActive ? null : new Date(),
      cancellationReason: tenant.isActive ? null : 'Migrated as suspended'
    });
    created++;
  }

  console.log(`Done. Created ${created} new subscription rows (${tenants.length - created} already existed).`);
  process.exit(0);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
