import { Request, Response } from "express";
import prisma from "../prismaClient";

export const addRating = async (req: Request, res: Response) => {
  const { stars, attractionId } = req.body;
  const userId = req.user?.userId;

  try {
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_attractionId: {
          userId,
          attractionId,
        },
      },
    });

    if (existingRating) {
      const updatedRating = await prisma.rating.update({
        where: {
          userId_attractionId: {
            userId,
            attractionId,
          },
        },
        data: {
          stars,
        },
      });
      res.json(updatedRating);
    } else {
      const newRating = await prisma.rating.create({
        data: {
          stars,
          userId,
          attractionId,
        },
      });
      res.status(201).json(newRating);
    }
  } catch {
    res.status(500).json({ error: "Error adding rating" });
  }
};
