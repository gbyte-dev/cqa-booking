const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = sequelize.define('AuditLog', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  tenantId: { type: DataTypes.STRING(36), allowNull: true, field: 'tenant_id' },
  outletId: { type: DataTypes.STRING(36), allowNull: true, field: 'outlet_id' },
  userId: { type: DataTypes.STRING(36), allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entityType: { type: DataTypes.STRING(50), allowNull: false, field: 'entity_type' },
  entityId: { type: DataTypes.STRING(36), allowNull: true, field: 'entity_id' },
  oldValues: { type: DataTypes.JSON, allowNull: true, field: 'old_values' },
  newValues: { type: DataTypes.JSON, allowNull: true, field: 'new_values' },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true, field: 'ip_address' },
  userAgent: { type: DataTypes.TEXT, allowNull: true, field: 'user_agent' }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});