import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/, // Valid Indian mobile number
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  totalWins: {
    type: Number,
    default: 0,
  },
  totalLoses: {
    type: Number,
    default: 0,
  },
  walletAmount: {
    type: Number,
    default: 0,
  },
  spins: [{
    type: Schema.Types.ObjectId,
    ref: 'Spin'
  }],

}, { timestamps: true });

export default model('User', userSchema);
