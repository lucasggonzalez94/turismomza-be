import { Request, Response } from "express";
import prisma from "../User/infrastructure/database/prismaClient";
import { validationResult } from "express-validator";
import { addOrRemoveFavoriteValidator } from "../validators";

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
        res.status(200).json({ ok: true });
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
      console.error(error);
      res.status(500).json({ error: "Error adding to favorites" });
    }
  },
];

export const listFavoritesByUser = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  const userId = req.user?.userId;

  try {
    const totalAttractions = await prisma.favorite.count({
      where: {
        userId,
      },
    });

    const favoriteAttractions = (await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        attraction: {
          include: {
            images: {
              select: {
                url: true,
              },
            },
            reviews: {
              select: {
                content: true,
                rating: true,
                user: {
                  select: {
                    name: true,
                  },
                },
                creation_date: true,
                likes: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                reports: true,
              },
            },
          },
        },
      },
      skip,
      take: pageSizeNumber,
    })) as { attraction: { images: any[]; reviews: any[] } }[];

    const attractions = favoriteAttractions.map(
      (favorite) => favorite.attraction
    );

    res.json({
      total: totalAttractions,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalAttractions / pageSizeNumber),
      data: attractions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching favorites" });
  }
};
