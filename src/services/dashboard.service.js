// src/services/dashboard.service.js

import User from '../models/user.model.js';
import Spin from '../models/spin.model.js';

export const getDashboardData = async () => {
  const totalUsers = await User.countDocuments();
  const totalSpins = await Spin.countDocuments();
  const totalWinners = await Spin.countDocuments({ result: 'win' });
  const totalLosers = await Spin.countDocuments({ result: 'lose' });

  const totalWallet = await User.aggregate([
    { $group: { _id: null, total: { $sum: '$walletAmount' } } },
  ]);

  const recentWinners = await Spin.find({ result: 'win' })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate([
      { path: 'user', select: 'name email' },
      { path: 'prize', select: 'name' },
    ]);

  const recentLosers = await Spin.find({ result: 'lose' })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate({ path: 'user', select: 'name email' });

  const recentWalletUpdates = await User.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('name walletAmount updatedAt');

  return {
    stats: {
      totalUsers,
      totalSpins,
      totalWinners,
      totalLosers,
      totalWalletAmount: totalWallet[0]?.total || 0,
    },
    recentWinners: recentWinners.map(spin => ({
      name: spin.user?.name || spin.visitorId,
      email: spin.user?.email || '',
      prizeName: spin.prize?.name || 'Cash',
      createdAt: spin.createdAt,
    })),
    recentLosers: recentLosers.map(spin => ({
      name: spin.user?.name || spin.visitorId,
      email: spin.user?.email || '',
      createdAt: spin.createdAt,
    })),
    walletUpdates: recentWalletUpdates.map(user => ({
      name: user.name,
      walletAmount: user.walletAmount,
      updatedAt: user.updatedAt,
    })),
  };
};
