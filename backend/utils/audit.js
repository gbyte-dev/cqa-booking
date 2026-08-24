const AuditLog = require('../models/AuditLog');

async function writeAudit({ req, action, entityType, entityId, metadata }) {
  try {
    await AuditLog.create({
      tenantId: req.user?.organizationId || null,
      outletId: req.user?.outletId || null,
      userId: req.user?.userId || null,
      action,
      entityType,
      entityId: entityId || null,
      newValues: metadata || null
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
}

module.exports = { writeAudit };
