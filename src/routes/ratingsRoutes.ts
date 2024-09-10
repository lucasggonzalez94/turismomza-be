import { Router } from 'express';
import { addRating } from '../controllers/ratingsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addRating);

export default router;
