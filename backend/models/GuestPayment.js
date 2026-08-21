const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = sequelize.define('GuestPayment', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  organizationId: { type: DataTypes.STRING(36), allowNull: false, field: 'organization_id' },
  bookingId: { type: DataTypes.STRING(36), allowNull: false, field: 'booking_id' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'INR' },
  status: { type: DataTypes.ENUM('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'), defaultValue: 'pending' },
  provider: { type: DataTypes.STRING(30), defaultValue: 'manual' },
  providerReference: { type: DataTypes.STRING(255), allowNull: true, field: 'provider_reference' },
  refundAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'refund_amount' },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, { tableName: 'guest_payments', timestamps: true, underscored: true });
