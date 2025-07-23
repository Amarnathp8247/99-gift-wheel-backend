// src/models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Tracks anonymous user session before signup
  visitorId: { type: String },

  totalWins: { type: Number, default: 0 },
  totalLoses: { type: Number, default: 0 },
  walletAmount: { type: Number, default: 0 },

  // Link to spins performed
  spins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Spin' }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
