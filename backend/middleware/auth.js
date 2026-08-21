const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'tenantId', 'roleCode']
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive or suspended'
      });
    }

    req.user = {
      userId: user.id,
      organizationId: user.tenantId,
      // Normalize 'super_admin' (new schema's role code) to 'superadmin'
      // to match the existing frontend/route checks written before the schema switch.
      role: user.roleCode === 'super_admin' ? 'superadmin' : user.roleCode
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
