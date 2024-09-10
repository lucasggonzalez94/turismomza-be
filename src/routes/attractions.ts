import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../server';

const router: Router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, authorizeRoles('publisher', 'admin'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('location').notEmpty(),
  body('category').notEmpty()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, location, category } = req.body;

  try {
    const attraction = await prisma.attraction.create({
      data: {
        title,
        description,
        location,
        category,
        creador_id: req?.user?.userId
      }
    });
    res.json(attraction);

  } catch (error) {
    res.status(500).json({ error: 'Error al crear la atracción.' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const attractions = await prisma.attraction.findMany();
    res.json(attractions);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las attractions.' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('publisher', 'admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const attraction = await prisma.attraction.findUnique({ where: { id: Number(id) } });
    if (!attraction) return res.status(404).json({ error: 'Atracción no encontrada.' });

    if (attraction.creador_id !== req?.user?.userId && req?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para editar esta atracción.' });
    }

    const updatedAtraccion = await prisma.attraction.update({
      where: { id: Number(id) },
      data: req.body
    });

    res.json(updatedAtraccion);

  } catch (error) {
    res.status(500).json({ error: 'Error al editar la atracción.' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('publisher', 'admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const attraction = await prisma.attraction.findUnique({ where: { id: Number(id) } });
    if (!attraction) return res.status(404).json({ error: 'Atracción no encontrada.' });

    if (attraction.creador_id !== req?.user?.userId && req?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta atracción.' });
    }

    await prisma.attraction.delete({ where: { id: Number(id) } });
    res.json({ message: 'Atracción eliminada.' });

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la atracción.' });
  }
});

export default router;
