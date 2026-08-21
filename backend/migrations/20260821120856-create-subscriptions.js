'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // =========================================================
    // 1. SUBSCRIPTION PLANS
    // =========================================================
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      billing_cycle: {
        type: Sequelize.STRING(50),
        allowNull: false
      },

      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USD'
      },

      max_outlets: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      max_users: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      max_reservations: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      features: {
        type: Sequelize.JSON,
        allowNull: true
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


    // =========================================================
    // 2. SUBSCRIPTIONS
    // =========================================================
    await queryInterface.createTable('subscriptions', {
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
        onDelete: 'CASCADE'
      },

      plan_id: {
        type: Sequelize.STRING(36),
        allowNull: false,

        references: {
          model: 'subscription_plans',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },

      trial_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },

      trial_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },

      auto_renew: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USD'
      },

      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      external_subscription_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
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
  },


  async down(queryInterface, Sequelize) {

    // subscriptions first because it has foreign keys
    await queryInterface.dropTable('subscriptions');

    // subscription_plans after subscriptions
    await queryInterface.dropTable('subscription_plans');
  }
};
