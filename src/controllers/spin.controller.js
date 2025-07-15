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

// 🎁 Prize Controllers
async function listPrizes(req, res) {
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

async function getPrize(req, res) {
  try {
    const result = await getPrizeById(req.params.id);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createPrize(req, res) {
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

async function updatePrize(req, res) {
  try {
    const result = await updatePrizeService(req.params.id, req.body);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deletePrize(req, res) {
  try {
    const result = await deletePrizeService(req.params.id);
    if (!result.status) return res.status(404).json({ message: result.message || 'Prize not found' });
    res.json({ message: 'Prize deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 🎡 Spin Logic
async function spinWheel(req, res) {
  try {
    const visitorId = req.body.visitorId;
    if (!visitorId) {
      return res.status(400).json({ status: false, message: 'visitorId is required' });
    }
    const result = await handleSpin(visitorId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ⚙️ Spin Config Controllers
async function createSpinConfig(req, res) {
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

async function updateSpinConfig(req, res) {
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

async function getSpinConfig(req, res) {
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

async function deleteSpinConfig(req, res) {
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

// ✅ Export all
export {
  listPrizes,
  getPrize,
  createPrize,
  updatePrize,
  deletePrize,
  spinWheel,
  createSpinConfig,
  updateSpinConfig,
  getSpinConfig,
  deleteSpinConfig
};
