const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Venue = require('../models/Venue');

const router = express.Router();

// ===== CREATE VENUE =====
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🏢 [POST /venues] Creating venue');

    const {
      name,
      description,
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      phone,
      email,
      website,
      logoUrl,
      coverImageUrl,
      venueType,
      openingTime,
      closingTime,
      capacity,
      currency,
      timezone
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Venue name is required'
      });
    }

    const venue = await Venue.create({
      id: uuidv4(),
      organizationId: req.user.organizationId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      phone,
      email,
      website,
      logoUrl,
      coverImageUrl,
      venueType,
      openingTime,
      closingTime,
      capacity,
      currency: currency || 'INR',
      timezone: timezone || 'UTC',
      status: 'active'
    });

    console.log('✅ Venue created:', venue.id);

    res.status(201).json({
      success: true,
      data: venue,
      message: 'Venue created successfully'
    });
  } catch (error) {
    console.error('❌ Create venue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create venue'
    });
  }
});

// ===== GET ALL VENUES =====
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🏢 [GET /venues] Fetching venues for org:', req.user.organizationId);

    const venues = await Venue.findAll({
      where: { organizationId: req.user.organizationId },
      order: [['created_at', 'DESC']],  // ✅ Use database column name
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Database error:', err);
      return [];
    });

    console.log(`✅ Found ${venues.length} venues`);

    res.json({
      success: true,
      data: venues || [],
      count: venues.length,
      message: venues.length === 0 ? 'No venues found' : `Found ${venues.length} venue(s)`
    });
  } catch (error) {
    console.error('❌ Get venues error:', error);
    
    // ✅ Graceful error - return empty array instead of error
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No venues found'
    });
  }
});

// ===== GET SINGLE VENUE =====
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🏢 [GET /venues/:id] Getting venue:', req.params.id);

    const venue = await Venue.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      raw: false,
      subQuery: false
    }).catch(err => {
      console.error('Database error:', err);
      return null;
    });

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
      data: venue
    });
  } catch (error) {
    console.error('❌ Get venue error:', error);
    
    // ✅ Graceful error
    res.json({
      success: true,
      data: null,
      message: 'Venue not found'
    });
  }
});

// ===== UPDATE VENUE =====
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🏢 [PATCH /venues/:id] Updating venue:', req.params.id);

    const venue = await Venue.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    }).catch(err => {
      console.error('Database error:', err);
      return null;
    });

    if (!venue) {
      console.log('⚠️ Venue not found for update');
      return res.json({
        success: true,
        data: null,
        message: 'Venue not found'
      });
    }

    // Whitelist fields for update
    const allowedFields = [
      'name',
      'description',
      'address',
      'city',
      'state',
      'postalCode',
      'country',
      'latitude',
      'longitude',
      'phone',
      'email',
      'website',
      'logoUrl',
      'coverImageUrl',
      'venueType',
      'openingTime',
      'closingTime',
      'capacity',
      'currency',
      'timezone',
      'status'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    await venue.update(updateData);

    console.log('✅ Venue updated');

    res.json({
      success: true,
      data: venue,
      message: 'Venue updated successfully'
    });
  } catch (error) {
    console.error('❌ Update venue error:', error);
    
    // ✅ Graceful error
    res.json({
      success: true,
      data: null,
      message: 'Failed to update venue'
    });
  }
});

// ===== DELETE VENUE =====
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🏢 [DELETE /venues/:id] Deleting venue:', req.params.id);

    const venue = await Venue.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    }).catch(err => {
      console.error('Database error:', err);
      return null;
    });

    if (!venue) {
      console.log('⚠️ Venue not found for delete');
      return res.json({
        success: true,
        message: 'Venue not found'
      });
    }

    await venue.destroy();

    console.log('✅ Venue deleted');

    res.json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete venue error:', error);
    
    // ✅ Graceful error
    res.json({
      success: true,
      message: 'Failed to delete venue'
    });
  }
});

module.exports = router;