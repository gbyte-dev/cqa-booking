'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_email_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Existing accounts predate email verification — treat them as already
    // verified so nobody currently active gets locked out of login.
    await queryInterface.sequelize.query('UPDATE users SET is_email_verified = true');
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'is_email_verified');
  }
};
