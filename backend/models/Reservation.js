const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  reservationCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'reservation_code'
  },
  outletId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'outlets', key: 'id' },
    field: 'outlet_id'
  },
  guestProfileId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'guest_profiles', key: 'id' },
    field: 'guest_profile_id'
  },
  tableId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'tables_daybeds', key: 'id' },
    field: 'table_id'
  },
  slotId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'time_slots', key: 'id' },
    field: 'slot_id'
  },
  guestCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    field: 'guest_count'
  },
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'reservation_date'
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
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'pending'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_requests'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'deposit_amount'
  },
  isDepositPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_deposit_paid'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Reservation;
