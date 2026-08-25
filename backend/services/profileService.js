const User = require('../models/User');
const Outlet = require('../models/Outlet');

exports.getProfile = async (userId, tenantId) => {
  const user = await User.findOne({
    where: { id: userId, tenantId },
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }]
  });
  if (!user) return { error: 'User not found', status: 404 };

  let managerName = null;
  if (user.roleCode === 'staff' && user.outletId) {
    const manager = await User.findOne({
      where: { tenantId, outletId: user.outletId, roleCode: 'manager', isActive: true }
    });
    managerName = manager ? manager.fullName : null;
  }

  return { user, managerName };
};

exports.updateProfile = async (userId, tenantId, { firstName, lastName, phone }) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  if (!user) return { error: 'User not found', status: 404 };

  const updateData = {};
  if (firstName !== undefined || lastName !== undefined) {
    const currentParts = (user.fullName || '').split(' ');
    const newFirst = firstName !== undefined ? firstName : currentParts[0] || '';
    const newLast = lastName !== undefined ? lastName : currentParts.slice(1).join(' ');
    updateData.fullName = `${newFirst} ${newLast}`.trim();
  }
  if (phone !== undefined) updateData.phone = phone;

  await user.update(updateData);

  return {
    user: await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }]
    })
  };
};

exports.updateAvatar = async (userId, tenantId, avatarUrl) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  if (!user) return { error: 'User not found', status: 404 };

  await user.update({ avatarUrl });

  return {
    user: await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'name'], required: false }]
    })
  };
};
