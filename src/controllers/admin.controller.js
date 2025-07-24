// import WheelItem from '../models/wheelItem.model.js';
import Admin from '../models/admin.model.js';
import userModel from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';

// Admin Login API
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: 'Email and password are required',
        messageCode: 'ADMIN_LOGIN_VALIDATION',
        data: null,
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        status: false,
        message: 'Invalid credentials',
        messageCode: 'ADMIN_LOGIN_INVALID',
        data: null,
      });
    }

    const token = generateToken({ id: admin._id, role: 'admin' });

    return res.status(200).json({
      status: true,
      message: 'Login successful',
      data: { token },
    });

  } catch (err) {
    next(err);
  }
};



export const getUsers = async (req, res) => {
  try {
    // Fetch users with spins and prize populated
    const users = await userModel
      .find()
      .select('-password -__v')
      .populate({
        path: 'spins',
        select: '_id prize createdAt',
        populate: {
          path: 'prize',
          select: 'name walletAmount'
        }
      });

    const usersWithStats = users.map(user => {
      const spins = user.spins || [];

      let totalWins = 0;
      let totalLoses = 0;

      // Count wins and loses
      spins.forEach(spin => {
        if (spin.prize?.name?.toLowerCase().includes('better luck')) {
          totalLoses++;
        } else {
          totalWins++;
        }
      });

      // Determine result based on latest spin
      const sortedSpins = [...spins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latestSpin = sortedSpins[0];
      let result = 'no spins';

      if (latestSpin?.prize?.name) {
        result = latestSpin.prize.name.toLowerCase().includes('better luck') ? 'lose' : 'win';
      }

      return {
        ...user.toObject(),
        totalWins,
        totalLoses,
        result
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      data: usersWithStats,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      messageCode: 'GET_USERS_ERROR',
      data: null,
    });
  }
};





