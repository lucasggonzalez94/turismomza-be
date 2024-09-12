import { Router } from 'express';
import { register, login, verifyTwoFactorCode, disableTwoFactorAuth, enableTwoFactorAuth } from '../controllers/authController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactorCode);
router.post('/enable-2fa', authenticateToken, enableTwoFactorAuth);
router.post('/disable-2fa', authenticateToken, disableTwoFactorAuth);

export default router;