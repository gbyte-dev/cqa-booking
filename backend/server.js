const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { setupAssociations } = require('./models/associations');

// ===== ROUTES IMPORTS =====
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const tableRoutes = require('./routes/tables');
const tenantBookingRoutes = require('./routes/tenant-bookings');         // ✅ ADD THIS
const superadminBookingRoutes = require('./routes/superadmin-bookings');
const superAdminRoutes = require('./routes/superadmin');
const organizationsRoutes = require('./routes/organizations');
const usersRoutes = require('./routes/users');
const customersRoutes = require('./routes/customers');

const app = express();

// ===== MIDDLEWARE =====
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== DATABASE CONNECTION =====
const startServer = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }
    console.log('✅ MySQL Database connected successfully!');
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
};

startServer();

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'MySQL',
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// ===== ROUTES REGISTRATION =====
console.log('\n📍 Registering API routes...\n');

// Auth
app.use('/api/v1/auth', authRoutes);
console.log('✅ Auth routes registered');

// Venues & Tables
app.use('/api/v1/venues', venueRoutes);
console.log('✅ Venues routes registered');

app.use('/api/v1/tables', tableRoutes);
console.log('✅ Tables routes registered');

// TENANT ROUTES
app.use('/api/v1/bookings', tenantBookingRoutes);           // ✅ FIXED PATH
console.log('✅ Tenant bookings routes registered');

app.use('/api/v1/customers', customersRoutes); 
console.log('✅ Customers routes registered');

// SUPERADMIN ROUTES
app.use('/api/v1/superadmin/bookings', superadminBookingRoutes);
console.log('✅ Superadmin bookings routes registered');

app.use('/api/v1/superadmin', superAdminRoutes);
console.log('✅ Superadmin dashboard routes registered');

app.use('/api/v1/organizations', organizationsRoutes);
console.log('✅ Organizations routes registered');

app.use('/api/v1/users', usersRoutes);
console.log('✅ Users routes registered');

console.log('\n✅ All routes registered successfully\n');

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 Database: MySQL (XAMPP)`);
  console.log(`📝 API Base: http://localhost:${PORT}/api/v1\n`);
});

module.exports = app;