import mongoose from 'mongoose';
import Spin from '../models/spin.model.js';
import Prize from '../models/prize.model.js';
import SpinConfig from '../models/spinConfig.model.js';
import AnonymousUser from '../models/anonymousUser.model.js';

const { ObjectId } = mongoose.Types;

// ======= Prize Services =======
export async function getAllPrizes() {
  try {
    const prizes = await Prize.find();
    return { status: true, message: 'Prizes fetched successfully', data: prizes };
  } catch (error) {
    return { status: false, message: 'Failed to fetch prizes', data: null };
  }
}

export async function getPrizeById(id) {
  try {
    const prize = await Prize.findById(id);
    if (!prize) return { status: false, message: 'Prize not found', data: null };
    return { status: true, message: 'Prize fetched successfully', data: prize };
  } catch (error) {
    return { status: false, message: 'Error fetching prize', data: null };
  }
}

export async function createPrize(data) {
  try {
    const prize = new Prize(data);
    const savedPrize = await prize.save();
    return { status: true, message: 'Prize created successfully', data: savedPrize };
  } catch (error) {
    console.error('Error creating prize:', error);
    return { status: false, message: 'Failed to create prize', data: null };
  }
}

export async function updatePrize(id, data) {
  try {
    const updated = await Prize.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return { status: false, message: 'Prize not found for update', data: null };
    return { status: true, message: 'Prize updated successfully', data: updated };
  } catch (error) {
    return { status: false, message: 'Error updating prize', data: null };
  }
}

export async function deletePrize(id) {
  try {
    const deleted = await Prize.findByIdAndDelete(id);
    if (!deleted) return { status: false, message: 'Prize not found for deletion', data: null };
    return { status: true, message: 'Prize deleted successfully', data: deleted };
  } catch (error) {
    return { status: false, message: 'Error deleting prize', data: null };
  }
}

// ======= SpinConfig Services =======
export async function createSpinConfig(data) {
  try {
    const existingConfig = await SpinConfig.findOne();
    if (existingConfig) {
      return { status: false, message: 'Spin configuration already exists. Use update instead.', data: null };
    }
    const config = new SpinConfig(data);
    const savedConfig = await config.save();
    return { status: true, message: 'Spin configuration saved successfully', data: savedConfig };
  } catch (error) {
    return { status: false, message: 'Failed to save spin configuration', data: null };
  }
}

export async function updateSpinConfig(data) {
  try {
    const updated = await SpinConfig.findOneAndUpdate({}, data, { new: true, upsert: true });
    return { status: true, message: 'Spin configuration updated successfully', data: updated };
  } catch (error) {
    return { status: false, message: 'Failed to update spin configuration', data: null };
  }
}

export async function getSpinConfig() {
  try {
    const config = await SpinConfig.find().sort({ createdAt: -1 }).limit(1);
    if (!config || config.length === 0) {
      return { status: false, message: 'Spin configuration not found', data: null };
    }
    return { status: true, message: 'Spin configuration fetched successfully', data: config[0] };
  } catch (error) {
    return { status: false, message: 'Failed to fetch spin configuration', data: null };
  }
}

export async function deleteSpinConfig(id) {
  try {
    const deleted = await SpinConfig.findByIdAndDelete(id);
    if (!deleted) return { status: false, message: 'Spin configuration not found', data: null };
    return { status: true, message: 'Spin configuration deleted successfully', data: deleted };
  } catch (error) {
    return { status: false, message: 'Error deleting spin configuration', data: null };
  }
}

// ========== Spin Logic ==========
function pickPrizeByChance(prizes) {
  const validPrizes = prizes.filter(p => p.chance > 0);
  const totalChance = validPrizes.reduce((sum, p) => sum + p.chance, 0);
  if (totalChance === 0) return null;

  const roll = Math.random() * totalChance;
  let cumulative = 0;

  for (const prize of validPrizes) {
    cumulative += prize.chance;
    if (roll <= cumulative) return prize;
  }

  return null;
}

function getTodayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function handleSpin(visitorId) {
  try {
    if (!visitorId) {
      return { status: false, message: 'visitorId is required' };
    }

    const cleanedVisitorId = visitorId.trim().toLowerCase();

    const config = await SpinConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return { status: false, message: 'Spin configuration not found' };
    }

    let anonUser = await AnonymousUser.findOne({ visitorId: cleanedVisitorId });
    if (!anonUser) {
      anonUser = new AnonymousUser({ visitorId: cleanedVisitorId });
      await anonUser.save();
    }

    const { start, end } = getTodayBounds();
    const spinsToday = await Spin.countDocuments({
      visitorId: cleanedVisitorId,
      createdAt: { $gte: start, $lt: end }
    });

    if (spinsToday >= (config.maxDailySpins || 1)) {
      return { status: false, message: 'You have already spun today' };
    }

    const winnersToday = await Spin.countDocuments({
      result: 'win',
      createdAt: { $gte: start, $lt: end }
    });

    const canWin = winnersToday < (config.maxDailyWinners || 1);

    let spinResult = 'lose';
    let prize = null;

    if (canWin && Math.random() <= config.winProbability) {
      const prizes = await Prize.find();
      const selectedPrize = pickPrizeByChance(prizes);

      if (selectedPrize) {
        // Treat prizes with cardClass 'red' as lose
        if (selectedPrize.cardClass && selectedPrize.cardClass.toLowerCase() === 'red') {
          spinResult = 'lose';
          prize = null;
        } else {
          spinResult = 'win';
          prize = selectedPrize;
        }
      }
    }

    const spinData = {
      visitorId: cleanedVisitorId,
      result: spinResult,
      ...(prize && { prize: prize._id })
    };

    const savedSpin = await Spin.create(spinData);

    return {
      status: true,
      message: spinResult === 'win' ? 'Congratulations! You won!' : 'Better luck next time!',
      data: {
        visitorId: cleanedVisitorId,
        result: spinResult,
        spinId: savedSpin._id,
        prize: prize ? {
          id: prize._id,
          name: prize.name,
          cardClass: prize.cardClass,
          brand: prize.brand,
          value: prize.value,
          walletAmount: prize.walletAmount,
          description: prize.description
        } : null
      }
    };

  } catch (error) {
    console.error('Spin Error:', error);
    return {
      status: false,
      message: 'An error occurred while processing your spin. Please try again.'
    };
  }
}

