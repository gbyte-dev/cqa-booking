const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Organization = require('./Organization');

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },

  // FOREIGN KEY
  organizationId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'organizations', key: 'id' },
    field: 'organization_id'
  },

  // BASIC INFO
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // ADDRESS
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'postal_code'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // COORDINATES
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },

  // CONTACT
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // IMAGES
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logo_url'
  },
  coverImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cover_image_url'
  },

  // VENUE DETAILS
  venueType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'venue_type'
  },
  openingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'opening_time'
  },
  closingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'closing_time'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // RATINGS & REVIEWS
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'average_rating'
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_reviews'
  },

  // STATUS & SETTINGS
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR'
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'UTC'
  },
  cancellationWindowHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 24,
    field: 'cancellation_window_hours'
  },
  cancellationRefundPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100,
    field: 'cancellation_refund_percent'
  },
  depositPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'deposit_percent'
  }

}, {
  tableName: 'venues',
  timestamps: true,
  underscored: false,  // Don't auto-convert camelCase to snake_case
  createdAt: 'created_at',  // ✅ Map to actual database column
  updatedAt: 'updated_at',  // ✅ Map to actual database column
  paranoid: true,           // Soft delete - uses deleted_at column
  deletedAt: 'deleted_at'   // ✅ Map to actual database column
});

// ===== ASSOCIATIONS =====


module.exports = Venue;