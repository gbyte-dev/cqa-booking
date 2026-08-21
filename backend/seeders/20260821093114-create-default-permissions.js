'use strict';

const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const permissions = [
      // =====================================================
      // ORGANIZATION / TENANT
      // =====================================================

      {
        code: 'tenant.view',
        name: 'View Tenant',
        domain: 'tenant',
        description: 'View tenant information.',
      },
      {
        code: 'tenant.create',
        name: 'Create Tenant',
        domain: 'tenant',
        description: 'Create a new tenant.',
      },
      {
        code: 'tenant.update',
        name: 'Update Tenant',
        domain: 'tenant',
        description: 'Update tenant information.',
      },
      {
        code: 'tenant.delete',
        name: 'Delete Tenant',
        domain: 'tenant',
        description: 'Delete a tenant.',
      },

      // =====================================================
      // OUTLET
      // =====================================================

      {
        code: 'outlet.view',
        name: 'View Outlet',
        domain: 'outlet',
        description: 'View outlet information.',
      },
      {
        code: 'outlet.create',
        name: 'Create Outlet',
        domain: 'outlet',
        description: 'Create a new outlet.',
      },
      {
        code: 'outlet.update',
        name: 'Update Outlet',
        domain: 'outlet',
        description: 'Update outlet information.',
      },
      {
        code: 'outlet.delete',
        name: 'Delete Outlet',
        domain: 'outlet',
        description: 'Delete an outlet.',
      },

      // =====================================================
      // USERS / STAFF
      // =====================================================

      {
        code: 'user.view',
        name: 'View Users',
        domain: 'user',
        description: 'View users.',
      },
      {
        code: 'user.create',
        name: 'Create User',
        domain: 'user',
        description: 'Create a new user.',
      },
      {
        code: 'user.update',
        name: 'Update User',
        domain: 'user',
        description: 'Update user information.',
      },
      {
        code: 'user.delete',
        name: 'Delete User',
        domain: 'user',
        description: 'Delete a user.',
      },

      // =====================================================
      // ROLES
      // =====================================================

      {
        code: 'role.view',
        name: 'View Roles',
        domain: 'role',
        description: 'View roles.',
      },
      {
        code: 'role.create',
        name: 'Create Role',
        domain: 'role',
        description: 'Create a role.',
      },
      {
        code: 'role.update',
        name: 'Update Role',
        domain: 'role',
        description: 'Update a role.',
      },
      {
        code: 'role.delete',
        name: 'Delete Role',
        domain: 'role',
        description: 'Delete a role.',
      },

      // =====================================================
      // PERMISSIONS
      // =====================================================

      {
        code: 'permission.view',
        name: 'View Permissions',
        domain: 'permission',
        description: 'View system permissions.',
      },
      {
        code: 'permission.manage',
        name: 'Manage Permissions',
        domain: 'permission',
        description: 'Manage role permissions.',
      },

      // =====================================================
      // TABLES / DAYBEDS
      // =====================================================

      {
        code: 'resource.view',
        name: 'View Tables and Daybeds',
        domain: 'resource',
        description: 'View tables and daybeds.',
      },
      {
        code: 'resource.create',
        name: 'Create Table or Daybed',
        domain: 'resource',
        description: 'Create tables or daybeds.',
      },
      {
        code: 'resource.update',
        name: 'Update Table or Daybed',
        domain: 'resource',
        description: 'Update tables or daybeds.',
      },
      {
        code: 'resource.delete',
        name: 'Delete Table or Daybed',
        domain: 'resource',
        description: 'Delete tables or daybeds.',
      },

      // =====================================================
      // TIME SLOTS / AVAILABILITY
      // =====================================================

      {
        code: 'availability.view',
        name: 'View Availability',
        domain: 'availability',
        description: 'View booking availability.',
      },
      {
        code: 'availability.manage',
        name: 'Manage Availability',
        domain: 'availability',
        description: 'Manage time slots and availability.',
      },

      // =====================================================
      // GUESTS
      // =====================================================

      {
        code: 'guest.view',
        name: 'View Guests',
        domain: 'guest',
        description: 'View guest profiles.',
      },
      {
        code: 'guest.create',
        name: 'Create Guest',
        domain: 'guest',
        description: 'Create guest profiles.',
      },
      {
        code: 'guest.update',
        name: 'Update Guest',
        domain: 'guest',
        description: 'Update guest information.',
      },
      {
        code: 'guest.delete',
        name: 'Delete Guest',
        domain: 'guest',
        description: 'Delete guest profiles.',
      },

      // =====================================================
      // RESERVATIONS
      // =====================================================

      {
        code: 'reservation.view',
        name: 'View Reservations',
        domain: 'reservation',
        description: 'View reservations.',
      },
      {
        code: 'reservation.create',
        name: 'Create Reservation',
        domain: 'reservation',
        description: 'Create a reservation.',
      },
      {
        code: 'reservation.update',
        name: 'Update Reservation',
        domain: 'reservation',
        description: 'Update a reservation.',
      },
      {
        code: 'reservation.cancel',
        name: 'Cancel Reservation',
        domain: 'reservation',
        description: 'Cancel a reservation.',
      },
      {
        code: 'reservation.delete',
        name: 'Delete Reservation',
        domain: 'reservation',
        description: 'Delete a reservation.',
      },

      // =====================================================
      // PAYMENTS
      // =====================================================

      {
        code: 'payment.view',
        name: 'View Payments',
        domain: 'payment',
        description: 'View payment transactions.',
      },
      {
        code: 'payment.manage',
        name: 'Manage Payments',
        domain: 'payment',
        description: 'Manage payment transactions.',
      },
      {
        code: 'payment.refund',
        name: 'Refund Payment',
        domain: 'payment',
        description: 'Process payment refunds.',
      },

      // =====================================================
      // NOTIFICATIONS
      // =====================================================

      {
        code: 'notification.view',
        name: 'View Notifications',
        domain: 'notification',
        description: 'View notifications.',
      },
      {
        code: 'notification.send',
        name: 'Send Notifications',
        domain: 'notification',
        description: 'Send guest or staff notifications.',
      },

      // =====================================================
      // AUDIT LOGS
      // =====================================================

      {
        code: 'audit.view',
        name: 'View Audit Logs',
        domain: 'audit',
        description: 'View system audit logs.',
      },

      // =====================================================
      // BADGES
      // =====================================================

      {
        code: 'badge.view',
        name: 'View Badges',
        domain: 'badge',
        description: 'View guest badges.',
      },
      {
        code: 'badge.manage',
        name: 'Manage Badges',
        domain: 'badge',
        description: 'Create and manage badges.',
      },

      // =====================================================
      // INCENTIVES
      // =====================================================

      {
        code: 'incentive.view',
        name: 'View Incentives',
        domain: 'incentive',
        description: 'View incentives.',
      },
      {
        code: 'incentive.manage',
        name: 'Manage Incentives',
        domain: 'incentive',
        description: 'Create and manage incentives.',
      },

      // =====================================================
      // WELLNESS
      // =====================================================

      {
        code: 'wellness.view',
        name: 'View Wellness Plans',
        domain: 'wellness',
        description: 'View wellness dining plans.',
      },
      {
        code: 'wellness.manage',
        name: 'Manage Wellness Plans',
        domain: 'wellness',
        description: 'Manage wellness dining plans.',
      },

      // =====================================================
      // DASHBOARD
      // =====================================================

      {
        code: 'dashboard.view',
        name: 'View Dashboard',
        domain: 'dashboard',
        description: 'View dashboard information.',
      },
    ];

    await queryInterface.bulkInsert(
      'permissions',
      permissions.map((permission) => ({
        id: randomUUID(),
        ...permission,
        created_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    const codes = [
      'tenant.view',
      'tenant.create',
      'tenant.update',
      'tenant.delete',

      'outlet.view',
      'outlet.create',
      'outlet.update',
      'outlet.delete',

      'user.view',
      'user.create',
      'user.update',
      'user.delete',

      'role.view',
      'role.create',
      'role.update',
      'role.delete',

      'permission.view',
      'permission.manage',

      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',

      'availability.view',
      'availability.manage',

      'guest.view',
      'guest.create',
      'guest.update',
      'guest.delete',

      'reservation.view',
      'reservation.create',
      'reservation.update',
      'reservation.cancel',
      'reservation.delete',

      'payment.view',
      'payment.manage',
      'payment.refund',

      'notification.view',
      'notification.send',

      'audit.view',

      'badge.view',
      'badge.manage',

      'incentive.view',
      'incentive.manage',

      'wellness.view',
      'wellness.manage',

      'dashboard.view',
    ];

    await queryInterface.bulkDelete('permissions', {
      code: {
        [Sequelize.Op.in]: codes,
      },
    });
  },
};