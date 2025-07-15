import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js' // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Get CLI args: node scripts/create-admin.js email password
const [, , emailArg, passwordArg] = process.argv;

async function createAdmin() {
  try {
    if (!emailArg || !passwordArg) {
      console.error('❌ Usage: npm run create-admin <email> <password>');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    const existing = await Admin.findOne({ email: emailArg });
    if (existing) {
      console.log(`⚠️ Admin already exists with email: ${emailArg}`);
      return process.exit(0);
    }

    const admin = new Admin({
      email: emailArg,
      password: passwordArg, // hashed automatically in pre-save hook
    });

    await admin.save();
    console.log('✅ Admin created:', admin.email);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
