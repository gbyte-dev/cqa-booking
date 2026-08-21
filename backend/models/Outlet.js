const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Outlet = sequelize.define('Outlet', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  venueType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'venue_type'
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'contact_email'
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'contact_phone'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'logo_url'
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'outlets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Outlet;
