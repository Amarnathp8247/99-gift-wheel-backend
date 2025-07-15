import { connect } from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async () => {
  try {
    await connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Stop the server if DB fails
  }
};

export default connectDB;
