import mongoose from 'mongoose';

const anonymousUserSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true },
  walletAmount: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalLoses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnonymousUser', anonymousUserSchema);
