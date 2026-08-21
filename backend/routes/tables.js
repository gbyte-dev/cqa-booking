const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Table = require('../models/Table');
const Venue = require('../models/Venue');

const router = express.Router();

// ===== CREATE TABLE =====
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { venueId, name, capacity, tableType, pricePerPerson, minCapacity } = req.body;

    if (!venueId || !name || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify venue belongs to organization
    const venue = await Venue.findOne({
      where: { id: venueId, organizationId: req.user.organizationId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    const table = await Table.create({
      id: uuidv4(),
      venueId,
      name,
      tableNumber: `T${Math.floor(Math.random() * 1000)}`,
      capacity,
      minCapacity: minCapacity || 1,
      tableType: tableType || 'standard',
      pricePerPerson: pricePerPerson || 0
    });

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
});

// ===== GET TABLES BY VENUE =====
router.get('/venue/:venueId', authMiddleware, async (req, res) => {
  try {
    const venue = await Venue.findOne({
      where: { id: req.params.venueId, organizationId: req.user.organizationId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }

    const tables = await Table.findAll({
      where: { venueId: req.params.venueId }
    });

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
});

// ===== UPDATE TABLE =====
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findOne({
      where: { id: req.params.id },
      include: [{
        model: Venue,
        as: 'Venue',
        where: { organizationId: req.user.organizationId },
        attributes: ['id']
      }]
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }

    await table.update(req.body);

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
});

// ===== DELETE TABLE =====
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findOne({
      where: { id: req.params.id },
      include: [{
        model: Venue,
        as: 'Venue',
        where: { organizationId: req.user.organizationId },
        attributes: ['id']
      }]
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }

    await table.destroy();

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
});

module.exports = router;