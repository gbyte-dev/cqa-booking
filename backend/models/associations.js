// ===== SEQUELIZE MODEL ASSOCIATIONS =====
// यह file सब associations को एक जगह define करती है
// circular dependencies avoid करने के लिए

const Organization = require('./Organization');
const User = require('./User');
const Venue = require('./Venue');
const Table = require('./Table');
const Booking = require('./Booking');
const Customer = require('./Customer');

function setupAssociations() {
  console.log('🔗 Setting up model associations...');

  // ===== ORGANIZATION ↔ USER =====
  Organization.hasMany(User, {
    foreignKey: 'organizationId',
    as: 'Users'
  });

  User.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'Organization'
  });

  // ===== ORGANIZATION ↔ VENUE =====
  Organization.hasMany(Venue, {
    foreignKey: 'organizationId',
    as: 'Venues'
  });

  Venue.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'Organization'
  });

  // ===== ORGANIZATION ↔ CUSTOMER =====
  Organization.hasMany(Customer, {
    foreignKey: 'organizationId',
    as: 'Customers'
  });

  Customer.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'Organization'
  });

  // ===== ORGANIZATION ↔ BOOKING =====
  Organization.hasMany(Booking, {
    foreignKey: 'organizationId',
    as: 'Bookings'
  });

  Booking.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'Organization'
  });

  // ===== VENUE ↔ TABLE =====
  Venue.hasMany(Table, {
    foreignKey: 'venueId',
    as: 'Tables'
  });

  Table.belongsTo(Venue, {
    foreignKey: 'venueId',
    as: 'Venue'
  });

  // ===== VENUE ↔ BOOKING =====
  Venue.hasMany(Booking, {
    foreignKey: 'venueId',
    as: 'Bookings'
  });

  Booking.belongsTo(Venue, {
    foreignKey: 'venueId',
    as: 'Venue'
  });

  // ===== TABLE ↔ BOOKING =====
  Table.hasMany(Booking, {
    foreignKey: 'tableId',
    as: 'Bookings'
  });

  Booking.belongsTo(Table, {
    foreignKey: 'tableId',
    as: 'Table'
  });

  // ===== CUSTOMER ↔ BOOKING =====
  Customer.hasMany(Booking, {
    foreignKey: 'customerId',
    as: 'Bookings'
  });

  Booking.belongsTo(Customer, {
    foreignKey: 'customerId',
    as: 'Customer'
  });

  // ===== USER ↔ CUSTOMER =====
  User.hasMany(Customer, {
    foreignKey: 'userId',
    as: 'Customers'
  });

  Customer.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
  });

  console.log('✅ All associations set up successfully');
}

module.exports = {
  setupAssociations,
  Organization,
  User,
  Venue,
  Table,
  Booking,
  Customer
};