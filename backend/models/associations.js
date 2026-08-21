// ===== SEQUELIZE MODEL ASSOCIATIONS =====
// यह file सब associations को एक जगह define करती है
// circular dependencies avoid करने के लिए

const Tenant = require('./Tenant');
const User = require('./User');
const Role = require('./Role');
const Outlet = require('./Outlet');
const GuestProfile = require('./GuestProfile');
const TableDaybed = require('./TableDaybed');
const TimeSlot = require('./TimeSlot');
const Reservation = require('./Reservation');
const Subscription = require('./Subscription');
const SubscriptionPlan = require('./SubscriptionPlan');

function setupAssociations() {
  console.log('🔗 Setting up model associations...');

  // ===== TENANT ↔ USER =====
  Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'Users' });
  User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'Tenant' });

  // ===== ROLE ↔ USER =====
  Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });

  // ===== TENANT ↔ OUTLET =====
  Tenant.hasMany(Outlet, { foreignKey: 'tenantId', as: 'Outlets' });
  Outlet.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'Tenant' });

  // ===== OUTLET ↔ USER =====
  Outlet.hasMany(User, { foreignKey: 'outletId', as: 'Users' });
  User.belongsTo(Outlet, { foreignKey: 'outletId', as: 'Outlet' });

  // ===== TENANT ↔ GUEST PROFILE =====
  Tenant.hasMany(GuestProfile, { foreignKey: 'tenantId', as: 'GuestProfiles' });
  GuestProfile.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'Tenant' });

  // ===== USER ↔ GUEST PROFILE =====
  User.hasMany(GuestProfile, { foreignKey: 'userId', as: 'GuestProfiles' });
  GuestProfile.belongsTo(User, { foreignKey: 'userId', as: 'User' });

  // ===== OUTLET ↔ TABLE/DAYBED =====
  Outlet.hasMany(TableDaybed, { foreignKey: 'outletId', as: 'Tables' });
  TableDaybed.belongsTo(Outlet, { foreignKey: 'outletId', as: 'Outlet' });

  // ===== OUTLET ↔ TIME SLOT =====
  Outlet.hasMany(TimeSlot, { foreignKey: 'outletId', as: 'TimeSlots' });
  TimeSlot.belongsTo(Outlet, { foreignKey: 'outletId', as: 'Outlet' });

  // ===== OUTLET ↔ RESERVATION =====
  Outlet.hasMany(Reservation, { foreignKey: 'outletId', as: 'Reservations' });
  Reservation.belongsTo(Outlet, { foreignKey: 'outletId', as: 'Outlet' });

  // ===== GUEST PROFILE ↔ RESERVATION =====
  GuestProfile.hasMany(Reservation, { foreignKey: 'guestProfileId', as: 'Reservations' });
  Reservation.belongsTo(GuestProfile, { foreignKey: 'guestProfileId', as: 'GuestProfile' });

  // ===== TABLE/DAYBED ↔ RESERVATION =====
  TableDaybed.hasMany(Reservation, { foreignKey: 'tableId', as: 'Reservations' });
  Reservation.belongsTo(TableDaybed, { foreignKey: 'tableId', as: 'Table' });

  // ===== TIME SLOT ↔ RESERVATION =====
  TimeSlot.hasMany(Reservation, { foreignKey: 'slotId', as: 'Reservations' });
  Reservation.belongsTo(TimeSlot, { foreignKey: 'slotId', as: 'Slot' });

  // ===== TENANT ↔ SUBSCRIPTION =====
  Tenant.hasMany(Subscription, { foreignKey: 'tenantId', as: 'Subscriptions' });
  Subscription.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'Tenant' });

  // ===== SUBSCRIPTION PLAN ↔ SUBSCRIPTION =====
  SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'Subscriptions' });
  Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'Plan' });

  console.log('✅ All associations set up successfully');
}

module.exports = {
  setupAssociations,
  Tenant,
  User,
  Role,
  Outlet,
  GuestProfile,
  TableDaybed,
  TimeSlot,
  Reservation,
  Subscription,
  SubscriptionPlan
};
