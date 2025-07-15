import { Router } from 'express';
import authRoutes from './auth.routes.js';
import spinRoutes from './spin.routes.js';
import adminRoutes from './admin.route.js';
import dashboardRoutes from './dashboard.routes.js';
import anonymousRoutes from './anonymous.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/spin', spinRoutes);
router.use('/admin', adminRoutes);
router.use('/user', anonymousRoutes)
router.use('/dashboard', dashboardRoutes)

export default router;
