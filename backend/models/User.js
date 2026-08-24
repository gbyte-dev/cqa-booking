const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'password_hash'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'full_name'
  },
  roleId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'roles', key: 'id' },
    field: 'role_id'
  },
  roleCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'role_code'
  },
  tenantId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'tenants', key: 'id' },
    field: 'tenant_id'
  },
  outletId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'outlets', key: 'id' },
    field: 'outlet_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'avatar_url'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
