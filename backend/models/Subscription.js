const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Organization = require('./Organization');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  organizationId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'organizations', key: 'id' },
    unique: true
  },
  plan: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
    defaultValue: 'starter'
  },
  // STARTER: $200/month
  // PROFESSIONAL: $500/month
  // ENTERPRISE: $2000/month (custom)
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // Starter: 1 venue, 50 bookings/day, 5 staff
  // Professional: 5 venues, 200 bookings/day, 20 staff
  // Enterprise: Unlimited
  maxVenues: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxStaff: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  maxBookingsPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cancellationDate: DataTypes.DATE,
  cancellationReason: DataTypes.TEXT
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true
});

// ===== ASSOCIATIONS =====
Organization.hasOne(Subscription, { foreignKey: 'organizationId' });
Subscription.belongsTo(Organization, { foreignKey: 'organizationId' });

module.exports = Subscription;