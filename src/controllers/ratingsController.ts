import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const addRating = async (req: Request, res: Response) => {
  const { stars, attractionId } = req.body;
  const userId = req.user?.id;

  try {
    const rating = await prisma.rating.create({
      data: {
        stars,
        userId,
        attractionId,
      },
    });
    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ error: 'Error adding rating' });
  }
};
