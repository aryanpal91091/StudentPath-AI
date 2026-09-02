import { Router } from 'express';
import { register, login, getMe, onboardStudent } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authenticated routes
router.get('/me', authenticateJWT, getMe);
router.post('/onboard', authenticateJWT, onboardStudent);

export default router;
