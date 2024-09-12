// src/routes/favoritosRoutes.ts

import { Router } from 'express';
import { addOrRemoveFavorite } from '../controllers/favoritesController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, addOrRemoveFavorite);

export default router;
