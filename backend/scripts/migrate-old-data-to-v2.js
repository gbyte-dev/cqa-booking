require('dotenv').config();
const mysql = require('mysql2/promise');

const ROLE_CODE_MAP = {
  admin: 'owner',
  superadmin: 'super_admin'
};

async function run() {
  const oldConn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const newConn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_V2,
    port: process.env.DB_PORT
  });

  const [roleRows] = await newConn.query('SELECT id, code FROM roles');
  const roleIdByCode = {};
  roleRows.forEach(r => { roleIdByCode[r.code] = r.id; });

  // ===== 1. organizations -> tenants =====
  const [orgs] = await oldConn.query('SELECT * FROM organizations');
  for (const o of orgs) {
    await newConn.query(
      'INSERT INTO tenants (id, name, slug, subscription_tier, stripe_customer_id, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)',
      [o.id, o.name, o.slug, o.subscription_plan || 'CORE', null, o.subscription_status === 'active' ? 1 : 0, o.created_at, o.updated_at]
    );
  }
  console.log(`✅ tenants: ${orgs.length} copied`);

  // ===== 2. users -> users =====
  const [users] = await oldConn.query('SELECT * FROM users');
  for (const u of users) {
    const roleCode = ROLE_CODE_MAP[u.role] || u.role;
    await newConn.query(
      'INSERT INTO users (id, email, phone, password_hash, full_name, role_id, role_code, tenant_id, outlet_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [
        u.id, u.email, u.phone, u.password_hash,
        [u.first_name, u.last_name].filter(Boolean).join(' ') || null,
        roleIdByCode[roleCode] || null, roleCode,
        u.organization_id, null,
        u.created_at, u.updated_at
      ]
    );
  }
  console.log(`✅ users: ${users.length} copied`);

  // ===== 3. customers -> guest_profiles =====
  const [customers] = await oldConn.query('SELECT * FROM customers');
  for (const c of customers) {
    await newConn.query(
      'INSERT INTO guest_profiles (id, tenant_id, user_id, email, phone, full_name, loyalty_tier, dietary_preferences, general_notes, vip_notes, is_vip, total_lifetime_spend, total_visits_count, last_visit_at, birthday, anniversary, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        c.id, c.organization_id, c.user_id, c.email, c.phone,
        [c.first_name, c.last_name].filter(Boolean).join(' ') || null,
        null, null, c.notes, null,
        c.is_vip || 0, c.total_spent || 0, c.total_bookings || 0,
        c.last_booking_date, c.date_of_birth, c.anniversary_date,
        c.created_at, c.updated_at
      ]
    );
  }
  console.log(`✅ guest_profiles: ${customers.length} copied`);

  // ===== 4. venues -> outlets =====
  const [venues] = await oldConn.query('SELECT * FROM venues');
  for (const v of venues) {
    await newConn.query(
      'INSERT INTO outlets (id, tenant_id, name, slug, venue_type, currency, timezone, contact_email, contact_phone, address, logo_url, settings, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        v.id, v.organization_id, v.name, v.slug, v.venue_type,
        v.currency, v.timezone, v.email, v.phone, v.address,
        v.logo_url, null, v.created_at, v.updated_at
      ]
    );
  }
  console.log(`✅ outlets: ${venues.length} copied`);

  // ===== 5. tables -> tables_daybeds =====
  const [tables] = await oldConn.query('SELECT * FROM tables');
  for (const t of tables) {
    await newConn.query(
      'INSERT INTO tables_daybeds (id, outlet_id, table_number, table_type, min_capacity, max_capacity, minimum_spend, is_active, location_zone, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        t.id, t.venue_id, t.table_number || t.name, t.table_type,
        t.min_capacity, t.capacity, 0, t.status === 'active' ? 1 : 0,
        null, t.created_at
      ]
    );
  }
  console.log(`✅ tables_daybeds: ${tables.length} copied`);

  // ===== 6. bookings -> reservations =====
  const [bookings] = await oldConn.query('SELECT * FROM bookings');

  // only keep table_id if it was actually migrated above
  const migratedTableIds = new Set(tables.map(t => t.id));

  for (const b of bookings) {
    await newConn.query(
      'INSERT INTO reservations (id, reservation_code, outlet_id, guest_profile_id, table_id, slot_id, guest_count, reservation_date, start_time, end_time, status, special_requests, deposit_amount, is_deposit_paid, cancellation_reason, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        b.id, b.id.slice(0, 8).toUpperCase(), b.venue_id, b.customer_id,
        migratedTableIds.has(b.table_id) ? b.table_id : null, null,
        b.num_guests, b.booking_date, b.booking_start_time, b.booking_end_time,
        b.booking_status, b.customer_special_requests || b.notes,
        b.deposit_required, Number(b.deposit_paid) > 0 ? 1 : 0,
        b.cancellation_reason, b.created_at, b.updated_at
      ]
    );
  }
  console.log(`✅ reservations: ${bookings.length} copied`);

  await oldConn.end();
  await newConn.end();
  console.log('\n🎉 Data migration complete!');
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
