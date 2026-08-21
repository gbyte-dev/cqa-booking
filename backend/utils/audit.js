const AuditLog = require('../models/AuditLog');

async function writeAudit({ req, action, entityType, entityId, metadata }) {
  try {
    await AuditLog.create({
      organizationId: req.user?.organizationId || null,
      userId: req.user?.userId || null,
      action,
      entityType,
      entityId: entityId || null,
      metadata: metadata || null
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
}

module.exports = { writeAudit };
