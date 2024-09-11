import { Router } from 'express';
import { addComment, reportComment, likeDislikeComment } from '../controllers/commentsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addComment);
router.post('/report', authenticateToken, reportComment);
router.post('/like', authenticateToken, likeDislikeComment);

export default router;
