import { Router } from 'express';
import { register } from '../controllers/auth.controller.js';      
import { validateRegister } from '../validators/auth.validator.js'; 

const router = Router();

// Use the validation middleware function, not the schema object itself
router.post('/register', validateRegister, register);

export default router;
