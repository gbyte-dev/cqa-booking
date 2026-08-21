'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // =========================================================
    // 1. TENANTS
    // =========================================================
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255)
      },
      slug: {
        type: Sequelize.STRING(255)
      },
      subscription_tier: {
        type: Sequelize.STRING(50)
      },
      stripe_customer_id: {
        type: Sequelize.STRING(255)
      },
      is_active: {
        type: Sequelize.TINYINT(1)
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 2. PERMISSIONS
    // =========================================================
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(100)
      },
      name: {
        type: Sequelize.STRING(255)
      },
      domain: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 3. ROLES
    // =========================================================
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(50)
      },
      name: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.TEXT
      },
      is_system: {
        type: Sequelize.TINYINT(1)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 4. OUTLETS
    // =========================================================
    await queryInterface.createTable('outlets', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255)
      },
      slug: {
        type: Sequelize.STRING(255)
      },
      venue_type: {
        type: Sequelize.STRING(50)
      },
      currency: {
        type: Sequelize.STRING(10)
      },
      timezone: {
        type: Sequelize.STRING(50)
      },
      contact_email: {
        type: Sequelize.STRING(255)
      },
      contact_phone: {
        type: Sequelize.STRING(50)
      },
      address: {
        type: Sequelize.TEXT
      },
      logo_url: {
        type: Sequelize.TEXT
      },
      settings: {
        type: Sequelize.JSON
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 5. ROLE PERMISSIONS
    // =========================================================
    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });


    // =========================================================
    // 6. USERS
    // =========================================================
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255)
      },
      phone: {
        type: Sequelize.STRING(50)
      },
      password_hash: {
        type: Sequelize.TEXT
      },
      full_name: {
        type: Sequelize.STRING(255)
      },
      role_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      role_code: {
        type: Sequelize.STRING(50)
      },
      tenant_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 7. TABLES / DAYBEDS
    // =========================================================
    await queryInterface.createTable('tables_daybeds', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      table_number: {
        type: Sequelize.STRING(50)
      },
      table_type: {
        type: Sequelize.STRING(50)
      },
      min_capacity: {
        type: Sequelize.INTEGER
      },
      max_capacity: {
        type: Sequelize.INTEGER
      },
      minimum_spend: {
        type: Sequelize.DECIMAL(10, 2)
      },
      is_active: {
        type: Sequelize.TINYINT(1)
      },
      location_zone: {
        type: Sequelize.STRING(100)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 8. TIME SLOTS
    // =========================================================
    await queryInterface.createTable('time_slots', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      slot_date: {
        type: Sequelize.DATEONLY
      },
      start_time: {
        type: Sequelize.TIME
      },
      end_time: {
        type: Sequelize.TIME
      },
      max_covers: {
        type: Sequelize.INTEGER
      },
      booked_covers: {
        type: Sequelize.INTEGER
      },
      is_available: {
        type: Sequelize.TINYINT(1)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 9. GUEST PROFILES
    // =========================================================
    await queryInterface.createTable('guest_profiles', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      email: {
        type: Sequelize.STRING(255)
      },
      phone: {
        type: Sequelize.STRING(50)
      },
      full_name: {
        type: Sequelize.STRING(255)
      },
      loyalty_tier: {
        type: Sequelize.STRING(50)
      },
      dietary_preferences: {
        type: Sequelize.JSON
      },
      general_notes: {
        type: Sequelize.TEXT
      },
      vip_notes: {
        type: Sequelize.TEXT
      },
      is_vip: {
        type: Sequelize.TINYINT(1)
      },
      total_lifetime_spend: {
        type: Sequelize.DECIMAL(12, 2)
      },
      total_visits_count: {
        type: Sequelize.INTEGER
      },
      last_visit_at: {
        type: Sequelize.DATE
      },
      birthday: {
        type: Sequelize.DATEONLY
      },
      anniversary: {
        type: Sequelize.DATEONLY
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 10. RESERVATIONS
    // =========================================================
    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      reservation_code: {
        type: Sequelize.STRING(20)
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      table_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'tables_daybeds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      slot_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'time_slots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      guest_count: {
        type: Sequelize.INTEGER
      },
      reservation_date: {
        type: Sequelize.DATEONLY
      },
      start_time: {
        type: Sequelize.TIME
      },
      end_time: {
        type: Sequelize.TIME
      },
      status: {
        type: Sequelize.STRING(50)
      },
      special_requests: {
        type: Sequelize.TEXT
      },
      deposit_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      is_deposit_paid: {
        type: Sequelize.TINYINT(1)
      },
      cancellation_reason: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 11. TRANSACTIONS
    // =========================================================
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      reservation_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'reservations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING(255)
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      currency: {
        type: Sequelize.STRING(10)
      },
      status: {
        type: Sequelize.STRING(50)
      },
      payment_method: {
        type: Sequelize.STRING(50)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 12. USER SESSIONS
    // =========================================================
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      refresh_token_hash: {
        type: Sequelize.STRING(255)
      },
      ip_address: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      is_revoked: {
        type: Sequelize.TINYINT(1)
      },
      expires_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 13. AUDIT LOGS
    // =========================================================
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      user_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(100)
      },
      entity_type: {
        type: Sequelize.STRING(50)
      },
      entity_id: {
        type: Sequelize.STRING(36)
      },
      old_values: {
        type: Sequelize.JSON
      },
      new_values: {
        type: Sequelize.JSON
      },
      ip_address: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 14. NOTIFICATIONS
    // =========================================================
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING(255)
      },
      message: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.STRING(50)
      },
      channel: {
        type: Sequelize.STRING(50)
      },
      status: {
        type: Sequelize.STRING(50)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 15. BADGES
    // =========================================================
    await queryInterface.createTable('badges', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(100)
      },
      name: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.TEXT
      },
      icon_url: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 16. GUEST BADGES
    // =========================================================
    await queryInterface.createTable('guest_badges', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      badge_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'badges',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unlocked_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 17. WELLNESS DINING PLANS
    // =========================================================
    await queryInterface.createTable('wellness_dining_plans', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      goal: {
        type: Sequelize.STRING(50)
      },
      diet_category: {
        type: Sequelize.STRING(100)
      },
      daily_schedule: {
        type: Sequelize.JSON
      },
      is_active: {
        type: Sequelize.TINYINT(1)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 18. INCENTIVES
    // =========================================================
    await queryInterface.createTable('incentives', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      outlet_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255)
      },
      type: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.TEXT
      },
      trigger_rule: {
        type: Sequelize.STRING(100)
      },
      valid_until: {
        type: Sequelize.DATE
      },
      is_active: {
        type: Sequelize.TINYINT(1)
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 19. GUEST INCENTIVES
    // =========================================================
    await queryInterface.createTable('guest_incentives', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      incentive_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_redeemed: {
        type: Sequelize.TINYINT(1)
      },
      redeemed_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 20. GHL SYNC LOGS
    // =========================================================
    await queryInterface.createTable('ghl_sync_logs', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      guest_profile_id: {
        type: Sequelize.STRING(36),
        references: {
          model: 'guest_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ghl_contact_id: {
        type: Sequelize.STRING(255)
      },
      pipeline_stage: {
        type: Sequelize.STRING(100)
      },
      status: {
        type: Sequelize.STRING(50)
      },
      synced_at: {
        type: Sequelize.DATE
      }
    });


    // =========================================================
    // 21. WEBHOOK LOGS
    // =========================================================
    await queryInterface.createTable('webhook_logs', {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      provider: {
        type: Sequelize.STRING(50)
      },
      event_type: {
        type: Sequelize.STRING(100)
      },
      payload: {
        type: Sequelize.JSON
      },
      status_code: {
        type: Sequelize.INTEGER
      },
      error_message: {
        type: Sequelize.TEXT
      },
      processed_at: {
        type: Sequelize.DATE
      }
    });
  },


  async down(queryInterface, Sequelize) {

    // Reverse order because of foreign keys
    await queryInterface.dropTable('webhook_logs');
    await queryInterface.dropTable('ghl_sync_logs');
    await queryInterface.dropTable('guest_incentives');
    await queryInterface.dropTable('incentives');
    await queryInterface.dropTable('wellness_dining_plans');
    await queryInterface.dropTable('guest_badges');
    await queryInterface.dropTable('badges');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('reservations');
    await queryInterface.dropTable('guest_profiles');
    await queryInterface.dropTable('time_slots');
    await queryInterface.dropTable('tables_daybeds');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('outlets');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('tenants');
  }
};