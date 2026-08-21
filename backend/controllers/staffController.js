const staffService = require('../services/staffService');

const toApiShape = (user) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : user;
  const [firstName, ...rest] = (plain.fullName || '').split(' ');
  return {
    ...plain,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    role: plain.roleCode,
    status: 'active'
  };
};

// ===== LIST STAFF =====
exports.list = async (req, res) => {
  try {
    const staff = await staffService.listStaff(req.user.organizationId);
    res.json({ success: true, data: staff.map(toApiShape), count: staff.length });
  } catch (error) {
    console.error('List staff error:', error);
    res.status(200).json({ success: true, data: [], count: 0 });
  }
};

// ===== CREATE STAFF =====
exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ success: false, error: 'First name and email are required' });
    }

    const result = await staffService.createStaff({
      tenantId: req.user.organizationId,
      firstName,
      lastName,
      email,
      phone,
      role,
      password
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
