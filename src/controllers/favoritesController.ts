import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const addFavorite = async (req: Request, res: Response) => {
  const { attractionId } = req.body;
  const userId = req.user?.id;

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        attractionId,
      },
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Error adding to favorites' });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  const { attractionId } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId,
        attractionId,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error removing from favorites' });
  }
};
