const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Booking = sequelize.define('Booking', {
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
  venueId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: { model: 'venues', key: 'id' },
    field: 'venue_id'
  },
  tableId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'tables', key: 'id' },
    field: 'table_id'
  },
  customerId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: { model: 'customers', key: 'id' },
    field: 'customer_id'
  },

  // CUSTOMER INFO (Direct)
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_name'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_email'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'customer_phone'
  },
  customerSpecialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'customer_special_requests'
  },

  // BOOKING DATES & TIMES
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'booking_date'
  },
  bookingStartTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'booking_start_time'
  },
  bookingEndTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'booking_end_time'
  },

  // GUEST INFO
  numGuests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'num_guests'
  },
  numAdults: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'num_adults'
  },
  numChildren: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'num_children'
  },
  actualGuestCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'actual_guest_count'
  },

  // BOOKING STATUS
  bookingStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    field: 'booking_status'
  },
  confirmationStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unconfirmed',
    field: 'confirmation_status'
  },
  noShow: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'no_show'
  },

  // CANCELLATION
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  cancellationBy: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'cancellation_by'
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancellation_date'
  },
  cancellationRefundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'cancellation_refund_amount'
  },

  // CHECK IN / OUT
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_in_time'
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_out_time'
  },

  // PAYMENT
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_amount'
  },
  depositRequired: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'deposit_required'
  },
  depositPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'deposit_paid'
  },
  depositPaymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    field: 'deposit_payment_status'
  },

  // SOURCE & NOTES
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'website',
    field: 'source'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'internal_notes'
  },

  // AUDIT
  createdBy: {
    type: DataTypes.STRING(36),
    allowNull: true,
    field: 'created_by'
  }

}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Booking;