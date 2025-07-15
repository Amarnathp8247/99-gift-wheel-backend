import mongoose from 'mongoose';

const anonymousUserSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnonymousUser', anonymousUserSchema);
