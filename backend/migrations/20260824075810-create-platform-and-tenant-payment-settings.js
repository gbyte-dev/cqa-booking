'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // =========================================================
    // 1. PLATFORM SETTINGS
    // =========================================================
    await queryInterface.createTable('platform_settings', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },

      setting_key: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
        comment: 'Unique platform setting key, e.g. payment_gateways'
      },

      setting_value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Setting value stored as JSON'
      },

      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'general',
        comment: 'general, payment, security, email, notification, etc.'
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      is_sensitive: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1 = Contains sensitive/encrypted information'
      },

      is_active: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Platform Settings Indexes
    await queryInterface.addIndex(
      'platform_settings',
      ['category'],
      {
        name: 'idx_platform_settings_category'
      }
    );

    await queryInterface.addIndex(
      'platform_settings',
      ['is_active'],
      {
        name: 'idx_platform_settings_active'
      }
    );


    // =========================================================
    // 2. TENANT PAYMENT GATEWAYS
    // =========================================================
    await queryInterface.createTable('tenant_payment_gateways', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },

      tenant_id: {
        type: Sequelize.STRING(36),
        allowNull: false,

        references: {
          model: 'tenants',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',

        comment: 'Tenant that owns this payment gateway configuration'
      },

      gateway_provider: {
        type: Sequelize.STRING(50),
        allowNull: false,

        comment:
          'stripe, razorpay, paypal, paytm, cashfree, etc.'
      },

      display_name: {
        type: Sequelize.STRING(100),
        allowNull: true,

        comment:
          'Display name of the payment gateway'
      },

      credentials: {
        type: Sequelize.JSON,
        allowNull: true,

        comment:
          'Encrypted gateway credentials and configuration'
      },

      environment: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'test',

        comment:
          'test or live'
      },

      supported_currencies: {
        type: Sequelize.JSON,
        allowNull: true,

        comment:
          'Currencies supported by this gateway'
      },

      is_enabled: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,

        comment:
          '1 = Gateway enabled for tenant'
      },

      is_primary: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,

        comment:
          '1 = Default gateway for customer payments'
      },

      webhook_url: {
        type: Sequelize.TEXT,
        allowNull: true,

        comment:
          'Tenant webhook endpoint'
      },

      webhook_secret: {
        type: Sequelize.TEXT,
        allowNull: true,

        comment:
          'Encrypted webhook signing secret'
      },

      settings: {
        type: Sequelize.JSON,
        allowNull: true,

        comment:
          'Additional gateway-specific settings'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });


    // =========================================================
    // TENANT PAYMENT GATEWAY INDEXES
    // =========================================================

    // Same tenant cannot configure same gateway twice
    await queryInterface.addIndex(
      'tenant_payment_gateways',
      ['tenant_id', 'gateway_provider'],
      {
        unique: true,
        name: 'unique_tenant_payment_gateway'
      }
    );

    // Faster lookup of enabled gateways
    await queryInterface.addIndex(
      'tenant_payment_gateways',
      ['tenant_id', 'is_enabled'],
      {
        name: 'idx_tenant_payment_gateway_enabled'
      }
    );

    // Faster lookup of primary gateway
    await queryInterface.addIndex(
      'tenant_payment_gateways',
      ['tenant_id', 'is_primary'],
      {
        name: 'idx_tenant_payment_gateway_primary'
      }
    );
  },


  // =========================================================
  // DOWN
  // =========================================================

  async down(queryInterface, Sequelize) {

    // Tenant payment gateways first
    // because it has foreign key to tenants
    await queryInterface.dropTable('tenant_payment_gateways');

    // Platform settings
    await queryInterface.dropTable('platform_settings');
  }
};