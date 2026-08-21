const promotionService = require('../services/promotionService');

exports.list = async (req, res) => {
  const promotions = await promotionService.listByOrganization(req.user.organizationId);
  res.json({ success: true, data: promotions });
};

exports.create = async (req, res) => {
  try {
    const result = await promotionService.create(req);

    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.promotion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.validate = async (req, res) => {
  const result = await promotionService.validate(req);

  if (result.error) {
    return res.status(result.status).json({ success: false, error: result.error });
  }

  res.json({ success: true, data: result.result });
};

exports.update = async (req, res) => {
  const promotion = await promotionService.update(req);

  if (!promotion) {
    return res.status(404).json({ success: false, error: 'Promotion not found' });
  }

  res.json({ success: true, data: promotion });
};
