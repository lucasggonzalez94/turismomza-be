import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const addOrRemoveFavorite = async (req: Request, res: Response) => {
  const { attractionId } = req.body;
  const userId = req.user?.userId;

  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_attractionId: {
          userId,
          attractionId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite?.id,
          userId,
        },
      });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          attractionId,
        },
      });
      res.status(201).json(favorite);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding to favorites' });
  }
};
