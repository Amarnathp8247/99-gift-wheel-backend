import mongoose from 'mongoose';

const spinConfigSchema = new mongoose.Schema({
  winProbability: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
  maxDailySpins: { type: Number, default: 100 },
  maxDailyWinners: { type: Number, default: 50 },
  prizes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    required: true,
  }],
}, { timestamps: true });

const SpinConfig = mongoose.model('SpinConfig', spinConfigSchema);

export default SpinConfig;
