const staffService = require('../services/staffService');

const toApiShape = (user, managerNameByOutletId = {}) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : user;
  const [firstName, ...rest] = (plain.fullName || '').split(' ');
  return {
    ...plain,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    role: plain.roleCode,
    venueId: plain.outletId,
    venueName: plain.Outlet?.name || null,
    managerName: plain.roleCode === 'staff' ? (managerNameByOutletId[plain.outletId] || null) : null,
    status: plain.isActive ? 'active' : 'inactive'
  };
};

// ===== LIST STAFF (optionally filtered by manager) =====
exports.list = async (req, res) => {
  try {
    const staff = await staffService.listStaff(req.user.organizationId, req.query.managerId);
    const managers = await staffService.listManagers(req.user.organizationId);

    // Only an ACTIVE manager can be shown as "the" manager for a venue's
    // staff — a suspended manager's outlet falls back to showing the venue
    // name on the frontend instead (member.managerName will be null here).
    const managerNameByOutletId = {};
    managers.forEach((manager) => {
      if (manager.outletId && manager.isActive) managerNameByOutletId[manager.outletId] = manager.fullName;
    });

    const data = staff.map((s) => toApiShape(s, managerNameByOutletId));
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('List staff error:', error);
    res.status(200).json({ success: true, data: [], count: 0 });
  }
};

// ===== LIST MANAGERS (with venue + team size) =====
exports.listManagers = async (req, res) => {
  try {
    const managers = await staffService.listManagers(req.user.organizationId);
    const data = managers.map((manager) => ({
      ...toApiShape(manager),
      teamSize: manager.teamSize || 0
    }));
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('List managers error:', error);
    res.status(200).json({ success: true, data: [], count: 0 });
  }
};

// ===== CREATE STAFF =====
exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password,outletId } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ success: false, error: 'First name and email are required' });
    }

    if (password && password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
    }

    const result = await staffService.createStaff({
      tenantId: req.user.organizationId,
      firstName,
      lastName,
      email,
      phone,
      role,
      password,
      outletId
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: toApiShape(result.user), message: 'Staff member added successfully' });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== UPDATE STAFF/MANAGER (name, phone, venue) =====
exports.update = async (req, res) => {
  try {
    const { firstName, lastName, phone, outletId } = req.body;

    const result = await staffService.updateStaff(req.params.id, req.user.organizationId, { firstName, lastName, phone, outletId });

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: toApiShape(result.user), message: 'Updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== SUSPEND STAFF/MANAGER =====
exports.suspend = async (req, res) => {
  try {
    const result = await staffService.suspendStaff(req.params.id, req.user.organizationId);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: toApiShape(result.user), message: 'Suspended successfully' });
  } catch (error) {
    console.error('Suspend staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== REACTIVATE STAFF/MANAGER =====
exports.reactivate = async (req, res) => {
  try {
    const result = await staffService.reactivateStaff(req.params.id, req.user.organizationId);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: toApiShape(result.user), message: 'Reactivated successfully' });
  } catch (error) {
    console.error('Reactivate staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== DELETE STAFF/MANAGER =====
exports.remove = async (req, res) => {
  try {
    const result = await staffService.deleteStaff(req.params.id, req.user.organizationId);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
