import { Router } from 'express';
import { addComment, reportComment, likeDislikeComment, deleteComment, editComment, listCommentsByAttraction } from '../controllers/commentsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.get('/:attractionId', authenticateToken, listCommentsByAttraction);
router.post('/', authenticateToken, addComment);
router.put('/:commentId', authenticateToken, editComment);
router.delete('/:commentId', authenticateToken, deleteComment);
router.post('/report', authenticateToken, reportComment);
router.post('/like', authenticateToken, likeDislikeComment);

export default router;
