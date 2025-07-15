// src/routes/dashboard.routes.js

import express from 'express';
import { dashboardStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/dashboard-stats', dashboardStats);

export default router;
