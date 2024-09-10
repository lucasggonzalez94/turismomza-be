import { Router } from 'express';
import { addComment, reportComment, likeComment, dislikeComment } from '../controllers/commentsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addComment);
router.post('/report', authenticateToken, reportComment);
router.post('/like', authenticateToken, likeComment);
router.post('/dislike', authenticateToken, dislikeComment);

export default router;
