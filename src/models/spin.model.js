import mongoose from 'mongoose';

const spinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  visitorId: {
    type: String,
    required: true,
    trim: true,
  },

  result: {
    type: String,
    enum: ['win', 'lose'],
    required: true,
  },

  prize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Spin', spinSchema);
