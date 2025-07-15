import mongoose from 'mongoose';
const prizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cardClass: { type: String, required: true },
  brand: { type: String, required: true },
  value: { type: String, required: true },
  codePrefix: { type: String, required: true },
  chance: { type: Number, required: true },
}, { timestamps: true });


const Prize = mongoose.model('Prize', prizeSchema);

export default Prize; // default export
