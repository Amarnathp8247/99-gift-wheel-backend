import { registerSchema } from '../validators/auth.validator.js';
import User from '../models/user.model.js';
import Spin from '../models/spin.model.js';
import bcrypt from 'bcryptjs';

export async function register(req, res, next) {
  try {
    // 1️⃣ Validate input using Joi schema
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
        messageCode: 'VALIDATION_ERROR',
        data: null,
      });
    }

    const { name, email, mobile, gender, city, parent_id, password, visitorId, walletAmount = 0 } = value;

    // 2️⃣ Check if email or mobile already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: 'Email or mobile already registered',
        messageCode: 'DUPLICATE_USER',
        data: null,
      });
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Default stats
    let totalWins = 0;
    let totalLoses = 0;
    let claimedWallet = 0;

    // 5️⃣ Get spin record from visitor ID
    if (visitorId) {
      const spinRecord = await Spin.findOne({ visitorId }).sort({ createdAt: -1 }).populate('prize');
      if (spinRecord) {
        if (spinRecord.result === 'win') {
          totalWins = 1;
          claimedWallet = spinRecord.prize?.value ? parseFloat(spinRecord.prize.value) : parseFloat(walletAmount || 0);
        } else if (spinRecord.result === 'lose') {
          totalLoses = 1;
        }
      }
    }

    // 6️⃣ Create and save the user
    const user = new User({
      name,
      email,
      mobile,
      gender,
      password: hashedPassword,
      parent_id: parent_id || null,
      city,
      totalWins,
      totalLoses,
      walletAmount: claimedWallet,
    });

    await user.save();

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        totalWins,
        totalLoses,
        walletAmount: claimedWallet,
      },
    });

  } catch (err) {
    next(err);
  }
}
