const tableService = require('../services/tableService');

// ===== CREATE TABLE =====
exports.create = async (req, res) => {
  try {
    const { venueId, name, capacity, tableType, pricePerPerson, minCapacity } = req.body;

    if (!venueId || !name || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const venue = await tableService.findVenueForOrg(venueId, req.user.organizationId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    const table = await tableService.create({ venueId, name, capacity, tableType, pricePerPerson, minCapacity });

    res.status(201).json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET TABLES BY VENUE =====
exports.listByVenue = async (req, res) => {
  try {
    const venue = await tableService.findVenueForOrg(req.params.venueId, req.user.organizationId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    const tables = await tableService.listByVenue(req.params.venueId);

    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== UPDATE TABLE =====
exports.update = async (req, res) => {
  try {
    const table = await tableService.findByIdForOrg(req.params.id, req.user.organizationId);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }

    await tableService.update(table, req.body);

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== DELETE TABLE =====
exports.remove = async (req, res) => {
  try {
    const table = await tableService.findByIdForOrg(req.params.id, req.user.organizationId);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }

    await tableService.remove(table);

    res.json({
      success: true,
      message: 'Table deleted'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
