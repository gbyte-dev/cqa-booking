const venueService = require('../services/venueService');

// Old frontend expects venue.city/status/capacity/openingTime/closingTime which
// no longer exist as columns on `outlets` — provide safe defaults so the UI doesn't break.
const toApiShape = (outlet) => {
  if (!outlet) return null;
  const plain = outlet.toJSON ? outlet.toJSON() : outlet;
  return {
    ...plain,
    name: plain.name,
    city: (plain.address || '').split(',').pop()?.trim() || '',
    email: plain.contactEmail,
    phone: plain.contactPhone,
    status: 'active',
    capacity: null,
    openingTime: null,
    closingTime: null,
    description: plain.settings?.description || ''
  };
};

// ===== CREATE VENUE =====
exports.create = async (req, res) => {
  try {
    console.log('🏢 [POST /venues] Creating venue');

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        error: 'Venue name is required'
      });
    }

    const venue = await venueService.create(req.user.organizationId, req.body);

    console.log('✅ Venue created:', venue.id);

    res.status(201).json({
      success: true,
      data: toApiShape(venue),
      message: 'Venue created successfully'
    });
  } catch (error) {
    console.error('❌ Create venue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create venue'
    });
  }
};

// ===== GET ALL VENUES =====
exports.list = async (req, res) => {
  try {
    console.log('🏢 [GET /venues] Fetching venues for org:', req.user.organizationId);

    const venues = await venueService.listByOrganization(req.user.organizationId);
    const data = venues.map(toApiShape);

    console.log(`✅ Found ${data.length} venues`);

    res.json({
      success: true,
      data,
      count: data.length,
      message: data.length === 0 ? 'No venues found' : `Found ${data.length} venue(s)`
    });
  } catch (error) {
    console.error('❌ Get venues error:', error);

    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No venues found'
    });
  }
};

// ===== GET SINGLE VENUE =====
exports.getOne = async (req, res) => {
  try {
    console.log('🏢 [GET /venues/:id] Getting venue:', req.params.id);

    const venue = await venueService.getById(req.params.id, req.user.organizationId);

    if (!venue) {
      console.log('⚠️ Venue not found');
      return res.json({
        success: true,
        data: null,
        message: 'Venue not found'
      });
    }

    console.log('✅ Venue found');

    res.json({
      success: true,
      data: toApiShape(venue)
    });
  } catch (error) {
    console.error('❌ Get venue error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Venue not found'
    });
  }
};

// ===== UPDATE VENUE =====
exports.update = async (req, res) => {
  try {
    console.log('🏢 [PATCH /venues/:id] Updating venue:', req.params.id);

    const venue = await venueService.update(req.params.id, req.user.organizationId, req.body);

    if (!venue) {
      console.log('⚠️ Venue not found for update');
      return res.json({
        success: true,
        data: null,
        message: 'Venue not found'
      });
    }

    console.log('✅ Venue updated');

    res.json({
      success: true,
      data: toApiShape(venue),
      message: 'Venue updated successfully'
    });
  } catch (error) {
    console.error('❌ Update venue error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to update venue'
    });
  }
};

// ===== DELETE VENUE =====
exports.remove = async (req, res) => {
  try {
    console.log('🏢 [DELETE /venues/:id] Deleting venue:', req.params.id);

    const deleted = await venueService.remove(req.params.id, req.user.organizationId);

    if (!deleted) {
      console.log('⚠️ Venue not found for delete');
      return res.json({
        success: true,
        message: 'Venue not found'
      });
    }

    console.log('✅ Venue deleted');

    res.json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete venue error:', error);

    res.json({
      success: true,
      message: 'Failed to delete venue'
    });
  }
};
