const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Organization = require('./Organization');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  organizationId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'organizations', key: 'id' }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: DataTypes.STRING(100),
  passwordHash: DataTypes.STRING(500),
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'staff', 'customer', 'superadmin'),
    defaultValue: 'staff'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSuperAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// ===== ASSOCIATIONS =====

module.exports = User;