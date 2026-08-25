'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_verification_tokens', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verified_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('email_verification_tokens', ['user_id']);
    await queryInterface.addIndex('email_verification_tokens', ['token_hash'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_verification_tokens');
  }
};
