import {
  getAllPrizes,
  getPrizeById,
  createPrize as createPrizeService,
  updatePrize as updatePrizeService,
  deletePrize as deletePrizeService,
  createSpinConfig as createSpinConfigService,
  updateSpinConfig as updateSpinConfigService,
  deleteSpinConfig as deleteSpinConfigService,
  getSpinConfig as getSpinConfigService,
  handleSpin,
} from '../services/spin.service.js';

import User from '../models/user.model.js'; // Make sure this path is correct

// 🎁 Prize Controllers
export async function listPrizes(req, res) {
  try {
    const result = await getAllPrizes();
    if (!result.status) {
      return res.status(500).json({ message: result.message });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPrize(req, res) {
  try {
    const result = await getPrizeById(req.params.id);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createPrize(req, res) {
  try {
    const result = await createPrizeService(req.body);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updatePrize(req, res) {
  try {
    const result = await updatePrizeService(req.params.id, req.body);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deletePrize(req, res) {
  try {
    const result = await deletePrizeService(req.params.id);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json({ message: 'Prize deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 🎡 Spin Logic
export async function spinWheel(req, res) {
  try {
    const { visitorId } = req.body;
    const fallbackId = visitorId; // fallback for anonymous users

    // Call the spin handler service
    const spinResult = await handleSpin(fallbackId);

    if (!spinResult.status) {
      return res.status(400).json(spinResult);
    }

    const { won, prize } = spinResult;

    // If the user is not anonymous and won a prize, update wallet
    if (won && prize && prize.value && userId && userId !== 'anonymous') {
      const user = await User.findById(userId);
      if (user) {
        user.walletAmount += parseFloat(prize.value);
        await user.save();
      }
    }

    // Return the result
    res.json(spinResult);
  } catch (err) {
    console.error('Spin error:', err.message);
    res.status(500).json({ status: false, message: err.message });
  }
}




// ⚙️ Spin Config Controllers
export async function createSpinConfig(req, res) {
  try {
    const { winProbability, maxDailySpins, maxDailyWinners, prizes } = req.body;

    if (!Array.isArray(prizes) || prizes.length === 0) {
      return res.status(400).json({ status: false, message: 'At least one prize is required' });
    }

    const result = await createSpinConfigService({
      winProbability,
      maxDailySpins,
      maxDailyWinners,
      prizes,
    });

    if (!result.status) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
}

export async function updateSpinConfig(req, res) {
  try {
    const data = req.body;

    if (data.prizes && (!Array.isArray(data.prizes) || data.prizes.length === 0)) {
      return res.status(400).json({ status: false, message: 'At least one prize is required' });
    }

    const result = await updateSpinConfigService(data);

    if (!result.status) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
}

export async function getSpinConfig(req, res) {
  try {
    const result = await getSpinConfigService();
    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}

export async function deleteSpinConfig(req, res) {
  try {
    const result = await deleteSpinConfigService(req.params.id);
    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}
