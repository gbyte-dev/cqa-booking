const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const GuestProfile = sequelize.define('GuestProfile', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  tenantId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'tenants', key: 'id' },
    field: 'tenant_id'
  },
  userId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'user_id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'full_name'
  },
  loyaltyTier: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'loyalty_tier'
  },
  dietaryPreferences: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'dietary_preferences'
  },
  generalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'general_notes'
  },
  vipNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'vip_notes'
  },
  isVip: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_vip'
  },
  totalLifetimeSpend: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'total_lifetime_spend'
  },
  totalVisitsCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_visits_count'
  },
  lastVisitAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_visit_at'
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  anniversary: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'guest_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GuestProfile;
