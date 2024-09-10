import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.post('/mark-as-read', authenticateToken, markAsRead);

export default router;
