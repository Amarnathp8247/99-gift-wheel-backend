// src/models/spin.model.js

import mongoose from 'mongoose';

const spinSchema = new mongoose.Schema({
  // 🔹 Logged-in user reference (if available)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Optional for anonymous users
  },

  // 🔹 Unique ID per anonymous or logged-in user (string UUID, session ID, etc.)
  visitorId: {
    type: String,
    required: true,
    trim: true,
  },

  // 🔹 Result of the spin
  result: {
    type: String,
    enum: ['win', 'lose'],
    required: true,
  },
  
  // 🔹 Optional prize reference (only if won)
  prize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null,
  },

  // 🔹 Auto timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Spin', spinSchema);
