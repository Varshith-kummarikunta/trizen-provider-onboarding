require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Bootstrap administrator account from environment variables.
 * Safe, idempotent, and non-destructive.
 * Automatically hashes password with bcrypt via User model pre('save') hook.
 *
 * @returns {Promise<Object>} The seeded or verified admin User document
 */
const bootstrapAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@trizen.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Trizen Platform Admin';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    let updated = false;

    // Ensure account has administrative privileges
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      updated = true;
    }

    // Synchronize password if not matching configured ADMIN_PASSWORD
    const isMatch = await existingAdmin.comparePassword(adminPassword);
    if (!isMatch) {
      existingAdmin.password = adminPassword;
      updated = true;
    }

    if (updated) {
      await existingAdmin.save();
      console.log(`[Admin Bootstrap] Synchronized role/credentials for admin: ${adminEmail}`);
    } else {
      console.log(`[Admin Bootstrap] Demo admin account verified and ready: ${adminEmail}`);
    }

    return existingAdmin;
  }

  // Create new admin user (triggers User schema pre('save') for bcrypt hashing)
  const newAdmin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log(`[Admin Bootstrap] Successfully initialized Demo Admin account:`);
  console.log(`                  Email: ${adminEmail}`);
  console.log(`                  Role:  admin`);

  return newAdmin;
};

// Standalone CLI execution: node utils/seedAdmin.js
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trizen_onboarding';
      await mongoose.connect(mongoUri);
      console.log('[Seed CLI] Connected to MongoDB.');

      await bootstrapAdmin();

      await mongoose.disconnect();
      console.log('[Seed CLI] Disconnected. Seeding completed successfully.');
      process.exit(0);
    } catch (error) {
      console.error(`[Seed CLI Error] Failed to seed admin user: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = {
  bootstrapAdmin,
  seedAdmin: bootstrapAdmin,
};
