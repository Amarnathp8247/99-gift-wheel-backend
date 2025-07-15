import { Router } from 'express';
import { getUsers, adminLogin } from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();

router.post('/login', adminLogin); // ✅ Admin login route
router.get('/users/list', authMiddleware, getUsers);


export default router;