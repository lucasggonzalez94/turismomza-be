import { Router } from 'express';
import { addReview, reportReview, likeDislikeReview, deleteReview, editReview } from '../controllers/reviewsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addReview);
router.put('/:reviewId', authenticateToken, editReview);
router.delete('/:reviewId', authenticateToken, deleteReview);
router.post('/report', authenticateToken, reportReview);
router.post('/like', authenticateToken, likeDislikeReview);

export default router;
