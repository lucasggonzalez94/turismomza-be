// src/routes/atraccionesRoutes.ts

import { Router } from 'express';
import { createAttraction, listAttractions, editAttraction, deleteAttraction } from '../controllers/attractionsController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createAttraction);
router.get('/', listAttractions);
router.put('/:id', authenticateToken, editAttraction);
router.delete('/:id', authenticateToken, deleteAttraction);

export default router;
