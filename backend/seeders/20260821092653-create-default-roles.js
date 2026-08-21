'use strict';

const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      {
        id: randomUUID(),
        code: 'super_admin',
        name: 'Super Admin',
        description: 'CQA platform administrator with full system access.',
        is_system: 1,
        created_at: now,
      },
      {
        id: randomUUID(),
        code: 'owner',
        name: 'Owner',
        description: 'Business owner who manages one or more outlets.',
        is_system: 1,
        created_at: now,
      },
      {
        id: randomUUID(),
        code: 'manager',
        name: 'Manager',
        description: 'Outlet manager responsible for daily restaurant operations.',
        is_system: 1,
        created_at: now,
      },
      {
        id: randomUUID(),
        code: 'staff',
        name: 'Staff',
        description: 'Restaurant staff responsible for operational tasks.',
        is_system: 1,
        created_at: now,
      },
      {
        id: randomUUID(),
        code: 'customer',
        name: 'Customer',
        description: 'Customer or guest who makes reservations.',
        is_system: 1,
        created_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      code: {
        [Sequelize.Op.in]: [
          'super_admin',
          'owner',
          'manager',
          'staff',
          'customer',
        ],
      },
    });
  },
};