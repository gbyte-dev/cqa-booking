'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const EmailVerificationToken = sequelize.define(
  'EmailVerificationToken',
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4()
    },

    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'token_hash'
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at'
    },

    /*
     * IMPORTANT
     *
     * JS attribute = createdAt
     * MySQL column   = created_at
     */
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  },
  {
    tableName: 'email_verification_tokens',

    /*
     * Timestamps are explicitly declared above.
     * This avoids Sequelize generating wrong timestamp
     * column names on different Sequelize configurations.
     */
    timestamps: false,

    freezeTableName: true
  }
);

module.exports = EmailVerificationToken;