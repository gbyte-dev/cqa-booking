const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Venue = require('./Venue');

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  venueId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'venues', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tableNumber: DataTypes.STRING(50),
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  minCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  tableType: {
    type: DataTypes.ENUM('standard', 'daybed', 'cabana', 'vip'),
    defaultValue: 'standard'
  },
  pricePerPerson: DataTypes.DECIMAL(10, 2),
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active'
  }
}, {
  tableName: 'tables',
  timestamps: true,
  underscored: true
});

// ===== ASSOCIATIONS =====

module.exports = Table;