const { sequelize } = require('../config/database');

async function addColumn(table, column, definition) {
  try {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  } catch (error) {
    if (!/duplicate column|already exists/i.test(error.message)) throw error;
  }
}

async function migrateCore() {
  await sequelize.query(`CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY, organization_id VARCHAR(36), user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id VARCHAR(36),
    metadata JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
    INDEX audit_org_created (organization_id, created_at)
  ) ENGINE=InnoDB`);
  await sequelize.query(`CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(36) PRIMARY KEY, organization_id VARCHAR(36) NOT NULL, code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL, discount_type ENUM('fixed','percentage') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL, starts_at DATETIME NULL, ends_at DATETIME NULL,
    usage_limit INT NULL, usage_count INT NOT NULL DEFAULT 0, minimum_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
    UNIQUE KEY promotion_org_code (organization_id, code)
  ) ENGINE=InnoDB`);
  await sequelize.query(`CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY, organization_id VARCHAR(36) NOT NULL, booking_id VARCHAR(36), customer_id VARCHAR(36),
    channel ENUM('email','sms','whatsapp') NOT NULL, event VARCHAR(50) NOT NULL, recipient VARCHAR(255) NOT NULL,
    status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued', payload JSON NULL, sent_at DATETIME NULL,
    error_message TEXT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
    INDEX notification_org_status (organization_id, status)
  ) ENGINE=InnoDB`);
  await sequelize.query(`CREATE TABLE IF NOT EXISTS guest_payments (
    id VARCHAR(36) PRIMARY KEY, organization_id VARCHAR(36) NOT NULL, booking_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL, currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status ENUM('pending','authorized','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
    provider VARCHAR(30) NOT NULL DEFAULT 'manual', provider_reference VARCHAR(255), refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    metadata JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
    INDEX guest_payment_booking (booking_id), INDEX guest_payment_org (organization_id)
  ) ENGINE=InnoDB`);
  await addColumn('users', 'password_reset_token', 'VARCHAR(255) NULL');
  await addColumn('users', 'password_reset_expires', 'DATETIME NULL');
  await addColumn('venues', 'cancellation_window_hours', 'INT NOT NULL DEFAULT 24');
  await addColumn('venues', 'cancellation_refund_percent', 'DECIMAL(5,2) NOT NULL DEFAULT 100');
  await addColumn('venues', 'deposit_percent', 'DECIMAL(5,2) NOT NULL DEFAULT 0');
  await addColumn('customers', 'loyalty_points', 'INT NOT NULL DEFAULT 0');
}

if (require.main === module) {
  migrateCore().then(() => sequelize.close()).catch(error => { console.error(error); process.exitCode = 1; });
}

module.exports = { migrateCore };
