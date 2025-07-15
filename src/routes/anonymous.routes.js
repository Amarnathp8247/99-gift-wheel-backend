import express from 'express';
import { createAnonymousUser } from '../controllers/anonymous.controller.js';

const router = express.Router();

router.post('/anonymous-user', createAnonymousUser);

export default router;
