const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Subscription = require('./Subscription');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  subscriptionId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'subscriptions', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'upi', 'bank_transfer'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(255),
    unique: true
  },
  stripePamentIntentId: DataTypes.STRING(255),
  invoiceNumber: {
    type: DataTypes.STRING(50),
    unique: true
  },
  billingPeriodStart: DataTypes.DATE,
  billingPeriodEnd: DataTypes.DATE,
  description: DataTypes.TEXT,
  notes: DataTypes.TEXT
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

// ===== ASSOCIATIONS =====
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId' });

module.exports = Payment;