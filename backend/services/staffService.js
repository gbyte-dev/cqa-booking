const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');
const Outlet = require('../models/Outlet');

const STAFF_ROLE_CODES = ['owner', 'manager', 'staff'];
const VENUE_SCOPED_ROLES = ['manager', 'staff'];

// managerId (optional): when provided, only staff assigned to that
// manager's venue are returned — powers the Staff tab's "Filter by
// Manager" dropdown. No separate managerId column: Staff and Manager are
// linked by sharing the same outletId (one manager per venue).
exports.listStaff = async (tenantId, managerId) => {
  const where = { tenantId, roleCode: { [Op.in]: STAFF_ROLE_CODES } };

  if (managerId) {
    const manager = await User.findOne({ where: { id: managerId, tenantId, roleCode: 'manager' } });
    if (!manager || !manager.outletId) return [];
    where.outletId = manager.outletId;
    where.roleCode = 'staff';
  }

  return User.findAll({
    where,
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }],
    order: [['created_at', 'DESC']]
  });
};

// Managers only, with their venue and how many Staff share that venue
// (their "team size") — powers the Managers tab table and the "Assign
// under Manager" picker on the Add Staff form.
exports.listManagers = async (tenantId) => {
  const managers = await User.findAll({
    where: { tenantId, roleCode: 'manager' },
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }],
    order: [['created_at', 'DESC']]
  });

  const withTeamSize = await Promise.all(managers.map(async (manager) => {
    const teamSize = manager.outletId
      ? await User.count({ where: { tenantId, outletId: manager.outletId, roleCode: 'staff' } })
      : 0;
    const plain = manager.toJSON();
    return { ...plain, teamSize };
  }));

  return withTeamSize;
};

exports.createStaff = async ({ tenantId, firstName, lastName, email, phone, role, password,outletId }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return { error: 'A user with this email already exists', status: 400 };
  }

  const roleCode = STAFF_ROLE_CODES.includes(role) ? role : 'staff';
  const roleRow = await Role.findOne({ where: { code: roleCode } });
  if (!roleRow) {
    return { error: 'Invalid role', status: 400 };
  }

  const passwordHash = await bcrypt.hash(password || 'Staff@123', 10);
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const user = await User.create({
    id: uuidv4(),
    tenantId,
    roleId: roleRow.id,
    roleCode,
    fullName,
    email,
    phone: phone || null,
    outletId: VENUE_SCOPED_ROLES.includes(roleCode) ? outletId : null,
    passwordHash
  });

  return {
    user: await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }]
    })
  };
};

const withOutletInclude = { include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }] };

// Finds the ACTIVE manager assigned to a venue — used to label a Staff
// row's "Manager" column. A suspended/deleted manager is deliberately
// excluded here (but still shown, with a Suspended badge, on the
// Managers tab itself via listManagers).
exports.findActiveManagerForOutlet = (tenantId, outletId) => {
  if (!outletId) return Promise.resolve(null);
  return User.findOne({ where: { tenantId, outletId, roleCode: 'manager', isActive: true } });
};

exports.updateStaff = async (id, tenantId, { firstName, lastName, phone, outletId }) => {
  const user = await User.findOne({ where: { id, tenantId, roleCode: { [Op.in]: ['manager', 'staff'] } } });
  if (!user) return { error: 'Staff member not found', status: 404 };

  const updateData = {};
  if (firstName !== undefined || lastName !== undefined) {
    const currentParts = (user.fullName || '').split(' ');
    const newFirst = firstName !== undefined ? firstName : currentParts[0] || '';
    const newLast = lastName !== undefined ? lastName : currentParts.slice(1).join(' ');
    updateData.fullName = `${newFirst} ${newLast}`.trim();
  }
  if (phone !== undefined) updateData.phone = phone;
  if (outletId !== undefined) updateData.outletId = outletId;

  await user.update(updateData);

  return { user: await User.findByPk(user.id, { attributes: { exclude: ['passwordHash'] }, ...withOutletInclude }) };
};

exports.suspendStaff = async (id, tenantId) => {
  const user = await User.findOne({ where: { id, tenantId, roleCode: { [Op.in]: ['manager', 'staff'] } } });
  if (!user) return { error: 'Staff member not found', status: 404 };

  await user.update({ isActive: false });
  return { user: await User.findByPk(user.id, { attributes: { exclude: ['passwordHash'] }, ...withOutletInclude }) };
};

exports.reactivateStaff = async (id, tenantId) => {
  const user = await User.findOne({ where: { id, tenantId, roleCode: { [Op.in]: ['manager', 'staff'] } } });
  if (!user) return { error: 'Staff member not found', status: 404 };

  await user.update({ isActive: true });
  return { user: await User.findByPk(user.id, { attributes: { exclude: ['passwordHash'] }, ...withOutletInclude }) };
};

exports.deleteStaff = async (id, tenantId) => {
  const user = await User.findOne({ where: { id, tenantId, roleCode: { [Op.in]: ['manager', 'staff'] } } });
  if (!user) return { error: 'Staff member not found', status: 404 };

  await user.destroy();
  return { success: true };
};
