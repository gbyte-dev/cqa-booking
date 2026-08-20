const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const createSuperAdmin = async () => {
  try {
    // Super Admin Organization बनाओ
    const superAdminOrg = await Organization.create({
      id: uuidv4(),
      name: 'CQA Admin',
      slug: 'cqa-admin',
      timezone: 'UTC',
      subscriptionStatus: 'active',
      maxVenues: 999
    });

    console.log('✅ Super Admin Organization created');

    // Super Admin User बनाओ
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    
    const superAdminUser = await User.create({
      id: uuidv4(),
      organizationId: superAdminOrg.id,
      email: 'superadmin@cqabooking.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      role: 'superadmin',
      isSuperAdmin: true,
      emailVerified: true
    });

    console.log('✅ Super Admin User created');

    // Subscription बनाओ
    await Subscription.create({
      id: uuidv4(),
      organizationId: superAdminOrg.id,
      plan: 'enterprise',
      monthlyPrice: 0,
      maxVenues: 999,
      maxStaff: 999,
      maxBookingsPerDay: 9999,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true
    });

    console.log('✅ Super Admin Subscription created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Email: superadmin@cqabooking.com');
    console.log('🔐 Password: SuperAdmin@123');
    console.log('👨‍💼 Role: Super Admin');
    console.log('\n⚠️  Change password after first login!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();