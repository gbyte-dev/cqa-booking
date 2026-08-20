const { Sequelize } = require('sequelize');
require('dotenv').config();

// ===== DATABASE CONNECTION =====
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// ===== TEST CONNECTION =====
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};