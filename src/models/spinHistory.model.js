const mongoose = require('mongoose');

const spinHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['win', 'lose'], default: 'lose' },
  prize: {
    name: String,
    cardClass: String,
    value: String,
    codePrefix: String,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpinHistory', spinHistorySchema);
