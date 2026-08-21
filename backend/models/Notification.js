const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = sequelize.define('Notification', {
  id: { type: DataTypes.STRING(36), primaryKey: true, defaultValue: () => uuidv4() },
  organizationId: { type: DataTypes.STRING(36), allowNull: false, field: 'organization_id' },
  bookingId: { type: DataTypes.STRING(36), allowNull: true, field: 'booking_id' },
  customerId: { type: DataTypes.STRING(36), allowNull: true, field: 'customer_id' },
  channel: { type: DataTypes.ENUM('email', 'sms', 'whatsapp'), allowNull: false },
  event: { type: DataTypes.STRING(50), allowNull: false },
  recipient: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('queued', 'sent', 'failed'), defaultValue: 'queued' },
  payload: { type: DataTypes.JSON, allowNull: true },
  sentAt: { type: DataTypes.DATE, allowNull: true, field: 'sent_at' },
  errorMessage: { type: DataTypes.TEXT, allowNull: true, field: 'error_message' }
}, { tableName: 'notifications', timestamps: true, underscored: true });
