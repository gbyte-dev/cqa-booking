const SubscriptionPlan = require('../models/SubscriptionPlan');

// ===== GET ACTIVE PLANS (public) =====
exports.list = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    });

    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('List subscription plans error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
