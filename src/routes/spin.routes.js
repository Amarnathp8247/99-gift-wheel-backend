import express from 'express';
import {
  listPrizes,
  getPrize,
  createPrize,
  updatePrize,
  deletePrize,
  spinWheel,
  createSpinConfig,
  getSpinConfig,
  updateSpinConfig,
  deleteSpinConfig
} from '../controllers/spin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Prize CRUD (Admin protected)
router.get('/prizes', listPrizes); // public or auth protected as needed
router.get('/prizes/:id', getPrize); // public or auth protected as needed
router.post('/prizes', authMiddleware, createPrize);
router.put('/prizes/:id', authMiddleware, updatePrize);
router.delete('/prizes/:id', authMiddleware, deletePrize);

// Spin Config (Admin only)
router.post('/config', authMiddleware, createSpinConfig);
router.get('/config', authMiddleware, getSpinConfig);
router.put('/config/:id', authMiddleware, updateSpinConfig);
router.delete('/config/:id', authMiddleware, deleteSpinConfig);

// Spin endpoint (User)
router.post('/handle/wheel', spinWheel);

export default router;
