const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// NOTE: this model previously mapped to organization_id/metadata/updated_at
// columns that do not exist on the live `audit_logs` table (it has tenant_id,
// old_values/new_values, and only created_at) — every writeAudit() call was
// silently failing (the util swallows the error). Fixed to match the real table.
module.exports = sequelize.define('AuditLog', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  organizationId: { type: DataTypes.STRING(36), allowNull: true, field: 'tenant_id' },
  outletId: { type: DataTypes.STRING(36), allowNull: true, field: 'outlet_id' },
  userId: { type: DataTypes.STRING(36), allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entityType: { type: DataTypes.STRING(50), allowNull: false, field: 'entity_type' },
  entityId: { type: DataTypes.STRING(36), allowNull: true, field: 'entity_id' },
  metadata: { type: DataTypes.JSON, allowNull: true, field: 'new_values' }
}, { tableName: 'audit_logs', timestamps: true, createdAt: 'created_at', updatedAt: false });
