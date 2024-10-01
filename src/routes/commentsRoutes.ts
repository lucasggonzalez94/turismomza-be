import { Router } from 'express';
import { addComment, reportComment, likeDislikeComment, deleteComment, editComment } from '../controllers/commentsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addComment);
router.put('/:commentId', authenticateToken, editComment);
router.delete('/:commentId', authenticateToken, deleteComment);
router.post('/report', authenticateToken, reportComment);
router.post('/like', authenticateToken, likeDislikeComment);

export default router;
