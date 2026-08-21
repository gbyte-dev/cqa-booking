const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const TableDaybed = sequelize.define('TableDaybed', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  outletId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'outlets', key: 'id' },
    field: 'outlet_id'
  },
  tableNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'table_number'
  },
  tableType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'table_type'
  },
  minCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'min_capacity'
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_capacity'
  },
  minimumSpend: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'minimum_spend'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    field: 'is_active'
  },
  locationZone: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'location_zone'
  }
}, {
  tableName: 'tables_daybeds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TableDaybed;
