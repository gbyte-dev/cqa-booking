const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = sequelize.define('AuditLog', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  organizationId: { type: DataTypes.STRING(36), allowNull: true, field: 'organization_id' },
  userId: { type: DataTypes.STRING(36), allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entityType: { type: DataTypes.STRING(50), allowNull: false, field: 'entity_type' },
  entityId: { type: DataTypes.STRING(36), allowNull: true, field: 'entity_id' },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, { tableName: 'audit_logs', timestamps: true, underscored: true });
