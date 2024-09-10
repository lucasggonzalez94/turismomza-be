// src/routes/favoritosRoutes.ts

import { Router } from 'express';
import { addFavorite, removeFavorite } from '../controllers/favoritesController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addFavorite);
router.delete('/', authenticateToken, removeFavorite);

export default router;
