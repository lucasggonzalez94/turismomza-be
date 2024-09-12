import { Router } from 'express';
import { register, login, verifyTwoFactorCode } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactorCode);

export default router;