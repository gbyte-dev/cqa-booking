const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },

  // FOREIGN KEYS
  organizationId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'organizations', key: 'id' },
    field: 'organization_id'
  },
  userId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'user_id'
  },

  // BASIC INFO
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // PERSONAL INFO
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_of_birth'
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // CUSTOMER TYPE
  customerType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'regular',
    field: 'customer_type'
  },

  // STATS
  totalBookings: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_bookings'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    field: 'total_spent'
  },
  averageSpending: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    field: 'average_spending'
  },
  lastBookingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_booking_date'
  },

  // PREFERENCES
  preferredContactMethod: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'preferred_contact_method'
  },
  marketingConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'marketing_consent'
  },

  // NOTES
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // STATUS & CRM
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    allowNull: true,
    defaultValue: 'active'
  },
  isVip: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_vip'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  anniversaryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'anniversary_date'
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'loyalty_points'
  }

}, {
  tableName: 'customers',
  timestamps: true,
  underscored: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Customer;