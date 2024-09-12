// src/routes/favoritosRoutes.ts

import { Router } from 'express';
import { addOrRemoveFavorite, listFavoritesByUser } from '../controllers/favoritesController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addOrRemoveFavorite);
router.get('/', authenticateToken, listFavoritesByUser);

export default router;
