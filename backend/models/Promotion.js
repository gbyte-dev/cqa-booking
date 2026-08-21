const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = sequelize.define('Promotion', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  organizationId: { type: DataTypes.STRING(36), allowNull: false, field: 'organization_id' },
  code: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  discountType: { type: DataTypes.ENUM('fixed', 'percentage'), allowNull: false, field: 'discount_type' },
  discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'discount_value' },
  startsAt: { type: DataTypes.DATE, allowNull: true, field: 'starts_at' },
  endsAt: { type: DataTypes.DATE, allowNull: true, field: 'ends_at' },
  usageLimit: { type: DataTypes.INTEGER, allowNull: true, field: 'usage_limit' },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'usage_count' },
  minimumSpend: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'minimum_spend' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'promotions', timestamps: true, underscored: true });
