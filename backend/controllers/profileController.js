const profileService = require('../services/profileService');

const toApiShape = (user, managerName = null) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : user;
  const [firstName, ...rest] = (plain.fullName || '').split(' ');
  return {
    id: plain.id,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    fullName: plain.fullName,
    email: plain.email,
    phone: plain.phone,
    role: plain.roleCode,
    venueId: plain.outletId,
    venueName: plain.Outlet?.name || null,
    managerName,
    status: plain.isActive ? 'active' : 'inactive',
    avatarUrl: plain.avatarUrl || null,
    createdAt: plain.created_at
  };
};

// ===== GET MY PROFILE =====
exports.getMe = async (req, res) => {
  try {
    const result = await profileService.getProfile(req.user.userId, req.user.organizationId);
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: toApiShape(result.user, result.managerName) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== UPDATE MY PROFILE (name, phone — NOT email) =====
exports.updateMe = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const result = await profileService.updateProfile(req.user.userId, req.user.organizationId, { firstName, lastName, phone });
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: toApiShape(result.user), message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== UPLOAD/UPDATE MY AVATAR =====
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await profileService.updateAvatar(req.user.userId, req.user.organizationId, avatarUrl);
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: toApiShape(result.user), message: 'Profile photo updated successfully' });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
