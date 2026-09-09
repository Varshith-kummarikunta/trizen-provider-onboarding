require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trizen_onboarding';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@trizen.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';
    const adminName = process.env.ADMIN_NAME || 'Trizen Platform Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Demo admin account already exists with email: ${adminEmail}`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Seed] Updated role to 'admin' for ${adminEmail}`);
      }
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`[Seed] Successfully created Demo Admin:`);
      console.log(`       Email:    ${adminEmail}`);
      console.log(`       Password: ${adminPassword}`);
      console.log(`       Role:     admin`);
    }

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
