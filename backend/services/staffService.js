const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');

const STAFF_ROLE_CODES = ['owner', 'manager', 'staff'];

exports.listStaff = (tenantId) => {
  return User.findAll({
    where: { tenantId, roleCode: { [Op.in]: STAFF_ROLE_CODES } },
    attributes: { exclude: ['passwordHash'] },
    order: [['created_at', 'DESC']]
  });
};

exports.createStaff = async ({ tenantId, firstName, lastName, email, phone, role, password }) => {
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
    passwordHash
  });

  return { user: await User.findByPk(user.id, { attributes: { exclude: ['passwordHash'] } }) };
};
