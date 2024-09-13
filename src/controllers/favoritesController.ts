import { Request, Response } from "express";
import prisma from "../prismaClient";
import { validationResult } from "express-validator";
import { addOrRemoveFavoriteValidator } from "../validators/favorites";

export const addOrRemoveFavorite = [
  ...addOrRemoveFavoriteValidator,
  async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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
  } catch {
    res.status(500).json({ error: "Error adding to favorites" });
  }
}];

export const listFavoritesByUser = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const favoriteAttractions = await prisma.favorite.findMany({
      where: {
        userId
      },
      include: {
        attraction: {
          include: {
            images: true,
            comments: true,
          },
        },
      },
    }) as { attraction: { images: any[], comments: any[] } }[];

    const attractions = favoriteAttractions.map(
      (favorite) => favorite.attraction
    );

    res.json(attractions);
  } catch {
    res.status(500).json({ error: "Error fetching favorites" });
  }
};
