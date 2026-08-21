const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const TimeSlot = sequelize.define('TimeSlot', {
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
  slotDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'slot_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'end_time'
  },
  maxCovers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_covers'
  },
  bookedCovers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'booked_covers'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    field: 'is_available'
  }
}, {
  tableName: 'time_slots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TimeSlot;
