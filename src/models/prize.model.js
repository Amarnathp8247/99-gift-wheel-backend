import mongoose from 'mongoose';
const prizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cardClass: { type: String, required: true },
  brand: { type: String, required: true },
  value: { type: String, required: true }, // Optional: could be a label like "₹50", etc.
  codePrefix: { type: String, required: false, default: '' },
  chance: { type: Number, required: true },
  walletAmount: { type: Number, default: 0 },  // 💰 Amount to be credited
  description: { type: String },
}, { timestamps: true });

const Prize = mongoose.model('Prize', prizeSchema);

export default Prize; 
