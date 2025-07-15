// src/services/spin.service.js

import Spin from '../models/spin.model.js';
import Prize from '../models/prize.model.js';
import SpinConfig from '../models/spinConfig.model.js';

// ======= Prize Services =======

export async function getAllPrizes() {
  try {
    const prizes = await Prize.find();
    return {
      status: true,
      message: 'Prizes fetched successfully',
      data: prizes,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to fetch prizes',
      data: null,
    };
  }
}

export async function getPrizeById(id) {
  try {
    const prize = await Prize.findById(id);
    if (!prize) {
      return {
        status: false,
        message: 'Prize not found',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Prize fetched successfully',
      data: prize,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error fetching prize',
      data: null,
    };
  }
}

export async function createPrize(data) {
  try {
    const prize = new Prize(data);
    const savedPrize = await prize.save();
    return {
      status: true,
      message: 'Prize created successfully',
      data: savedPrize,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to create prize',
      data: null,
    };
  }
}

export async function updatePrize(id, data) {
  try {
    const updated = await Prize.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return {
        status: false,
        message: 'Prize not found for update',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Prize updated successfully',
      data: updated,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error updating prize',
      data: null,
    };
  }
}

export async function deletePrize(id) {
  try {
    const deleted = await Prize.findByIdAndDelete(id);
    if (!deleted) {
      return {
        status: false,
        message: 'Prize not found for deletion',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Prize deleted successfully',
      data: deleted,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error deleting prize',
      data: null,
    };
  }
}

// ======= SpinConfig Services =======

export async function createSpinConfig(data) {
  try {
    // If you want only one SpinConfig, check if one exists first:
    const existingConfig = await SpinConfig.findOne();
    if (existingConfig) {
      return {
        status: false,
        message: 'Spin configuration already exists. Use update instead.',
        data: null,
      };
    }

    const config = new SpinConfig(data);
    const savedConfig = await config.save();
    return {
      status: true,
      message: 'Spin configuration saved successfully',
      data: savedConfig,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to save spin configuration',
      data: null,
    };
  }
}

/**
 * Update existing SpinConfig
 * If no config exists, create one
 */
export async function updateSpinConfig(data) {
  try {
    const updated = await SpinConfig.findOneAndUpdate({}, data, { new: true, upsert: true });
    return {
      status: true,
      message: 'Spin configuration updated successfully',
      data: updated,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to update spin configuration',
      data: null,
    };
  }
}

export async function getSpinConfig() {
  try {
    const config = await SpinConfig.find().sort({ createdAt: -1 });
    if (!config) {
      return {
        status: false,
        message: 'Spin configuration not found',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Spin configuration fetched successfully',
      data: config,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Failed to fetch spin configuration',
      data: null,
    };
  }
}

// ========== Spin Logic ==========

// Helper: Get today's time range
function getTodayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

// Helper: Pick prize by weighted chance
function pickPrizeByChance(prizes) {
  const validPrizes = prizes.filter((p) => p.chance > 0);
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

// Main Spin Logic
export async function handleSpin(visitorId) {
  if (!visitorId) {
    return { status: 'error', message: 'visitorId is required' };
  }

  const config = await SpinConfig.findOne().sort({ createdAt: -1 });
  if (!config) {
    return { status: 'error', message: 'Spin configuration not found' };
  }

  const { start, end } = getTodayBounds();

  // 1️⃣ Check user daily spin limit
  const userSpinsToday = await Spin.countDocuments({
    visitorId,
    createdAt: { $gte: start, $lt: end },
  });

  const userLimit = config.maxDailySpinsPerUser || 1;
  if (userSpinsToday >= userLimit) {
    return { status: 'limit', message: 'You have already spun today' };
  }

  // 2️⃣ Check global daily spin limit
  const totalSpins = await Spin.countDocuments({
    createdAt: { $gte: start, $lt: end },
  });
  if (totalSpins >= config.maxDailySpins) {
    return { status: 'limit', message: 'Max daily spins reached. Try again tomorrow.' };
  }

  // 3️⃣ Determine winning logic
  const totalWins = await Spin.countDocuments({
    result: 'win',
    createdAt: { $gte: start, $lt: end },
  });

  const winRoll = Math.random();
  const isWinner = winRoll <= config.winProbability && totalWins < config.maxDailyWinners;

  if (isWinner) {
    const prizes = await Prize.find({}); // Optionally filter by active
    const prize = pickPrizeByChance(prizes);
    if (!prize) {
      return { status: 'error', message: 'No prize available to select' };
    }

    // Record win
    await Spin.create({
      visitorId,
      result: 'win',
      prize: prize._id,
    });

    return {
      status: 'win',
      prize: {
        _id: prize._id,
        name: prize.name,
        cardClass: prize.cardClass,
        brand: prize.brand,
        value: prize.value,
        codePrefix: prize.codePrefix || '',
      },
    };
  } else {
    // Record lose
    await Spin.create({ visitorId, result: 'lose' });
    return { status: 'lose' };
  }
}


// Add this function
export async function deleteSpinConfig(id) {
  try {
    const deleted = await SpinConfig.findByIdAndDelete(id);
    if (!deleted) {
      return {
        status: false,
        message: 'Spin configuration not found',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Spin configuration deleted successfully',
      data: deleted,
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error deleting spin configuration',
      data: null,
    };
  }
}


