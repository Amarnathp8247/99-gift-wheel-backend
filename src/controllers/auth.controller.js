import User from '../models/user.model.js';
import Spin from '../models/spin.model.js';
import Prize from '../models/prize.model.js';
import bcrypt from 'bcrypt';
import axios from 'axios';

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      city,
      visitorId,
      parent_id = null,
    } = req.body;

    if (!name || !email || !mobile || !password || !city) {
      return res.status(400).json({
        status: false,
        message: 'All fields including visitorId are required',
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'User already exists with given email or mobile',
      });
    }

    // ✅ Find anonymous spins linked to visitorId
    const anonymousSpins = await Spin.find({ visitorId, user: null }).populate('prize');

    const walletFromSpins = anonymousSpins.reduce((sum, spin) => {
      return spin.result === 'win' && spin.prize?.walletAmount
        ? sum + spin.prize.walletAmount
        : sum;
    }, 0);

    let syncError = null;
    try {
      const response = await axios.post(
        'https://api2.99gift.in/api/v6/user/register',
        {
          name,
          email,
          mobile,
          password,
          parent_id,
          city,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            Origin: 'https://www.99gift.in',
            Referer: 'https://www.99gift.in/',
          },
        }
      );
      const syncResult = response.data;
      if (!syncResult.status) {
        syncError = syncResult.message || 'Unknown error from 99Gift';
      }
    } catch (error) {
      syncError = error.response?.data?.message || error.message || '99Gift sync failed';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      city,
      parent_id,
      walletAmount: walletFromSpins,
      visitorId, // ✅ store visitorId
    });

    await newUser.save();

    const spinIds = anonymousSpins.map((s) => s._id);
    await Spin.updateMany(
      { _id: { $in: spinIds } },
      { $set: { user: newUser._id } }
    );

    newUser.spins = spinIds;
    await newUser.save();

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      walletCredited: walletFromSpins,
      visitorId, // ✅ Added in response
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        city: newUser.city,
        parent_id: newUser.parent_id,
        walletAmount: newUser.walletAmount,
        totalWins: newUser.totalWins,
        totalLoses: newUser.totalLoses,
        spins: newUser.spins,
      },
      syncError,
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Registration failed',
    });
  }
};
