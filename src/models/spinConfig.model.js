// src/models/spinConfig.model.js
import mongoose from 'mongoose';

const spinConfigSchema = new mongoose.Schema({
  winProbability: { type: Number, default: 0.5 }, // Overall win chance
  maxDailySpins: { type: Number, default: 100 },
  maxDailyWinners: { type: Number, default: 50 },
  prizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prize' }] // References to Prize model
}, { timestamps: true });

const SpinConfig = mongoose.model('SpinConfig', spinConfigSchema);

export default SpinConfig;
