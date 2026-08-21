'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `
      SELECT id, code
      FROM roles
      WHERE code IN (
        'super_admin',
        'owner',
        'manager',
        'staff',
        'customer'
      )
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const permissions = await queryInterface.sequelize.query(
      `
      SELECT id, code
      FROM permissions
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const roleMap = Object.fromEntries(
      roles.map((role) => [role.code, role.id])
    );

    const permissionMap = Object.fromEntries(
      permissions.map((permission) => [
        permission.code,
        permission.id,
      ])
    );

    const rolePermissions = [];

    const addPermissions = (roleCode, permissionCodes) => {
      for (const permissionCode of permissionCodes) {
        if (!roleMap[roleCode]) {
          throw new Error(
            `Role not found: ${roleCode}`
          );
        }

        if (!permissionMap[permissionCode]) {
          throw new Error(
            `Permission not found: ${permissionCode}`
          );
        }

        rolePermissions.push({
          role_id: roleMap[roleCode],
          permission_id: permissionMap[permissionCode],
        });
      }
    };

    // =====================================================
    // SUPER ADMIN
    // Full CQA platform access
    // =====================================================

    addPermissions('super_admin', Object.keys(permissionMap));

    // =====================================================
    // OWNER
    // Business owner access
    // =====================================================

    addPermissions('owner', [
      'tenant.view',
      'tenant.update',

      'outlet.view',
      'outlet.create',
      'outlet.update',
      'outlet.delete',

      'user.view',
      'user.create',
      'user.update',
      'user.delete',

      'role.view',

      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',

      'availability.view',
      'availability.manage',

      'guest.view',
      'guest.create',
      'guest.update',

      'reservation.view',
      'reservation.create',
      'reservation.update',
      'reservation.cancel',

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
    ]);

    // =====================================================
    // MANAGER
    // Outlet management
    // =====================================================

    addPermissions('manager', [
      'tenant.view',

      'outlet.view',
      'outlet.update',

      'user.view',
      'user.create',
      'user.update',

      'role.view',

      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',

      'availability.view',
      'availability.manage',

      'guest.view',
      'guest.create',
      'guest.update',

      'reservation.view',
      'reservation.create',
      'reservation.update',
      'reservation.cancel',

      'payment.view',
      'payment.manage',

      'notification.view',
      'notification.send',

      'badge.view',

      'incentive.view',

      'wellness.view',

      'dashboard.view',
    ]);

    // =====================================================
    // STAFF
    // Daily operational access
    // =====================================================

    addPermissions('staff', [
      'outlet.view',

      'resource.view',

      'availability.view',

      'guest.view',
      'guest.create',
      'guest.update',

      'reservation.view',
      'reservation.create',
      'reservation.update',
      'reservation.cancel',

      'payment.view',

      'notification.view',
      'notification.send',

      'badge.view',

      'dashboard.view',
    ]);

    // =====================================================
    // CUSTOMER / GUEST
    // Own booking related access
    // =====================================================

    addPermissions('customer', [
      'outlet.view',

      'availability.view',

      'guest.view',
      'guest.update',

      'reservation.view',
      'reservation.create',
      'reservation.update',
      'reservation.cancel',

      'payment.view',

      'notification.view',

      'badge.view',

      'incentive.view',

      'wellness.view',
    ]);

    await queryInterface.bulkInsert(
      'role_permissions',
      rolePermissions
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
      DELETE rp
      FROM role_permissions rp
      INNER JOIN roles r
        ON r.id = rp.role_id
      WHERE r.code IN (
        'super_admin',
        'owner',
        'manager',
        'staff',
        'customer'
      )
      `,
      {
        type: Sequelize.QueryTypes.DELETE,
      }
    );
  },
};