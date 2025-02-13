import { PrismaClient } from "@prisma/client";
import { FavoriteRepository } from "../../domain/ports/FavoriteRepository";
import { Favorite } from "../../domain/entities/Favorite";

const prisma = new PrismaClient();

export class PrismaFavoriteRepository implements FavoriteRepository {
  async addOrRemove(placeId: string, userId: string): Promise<Favorite | void> {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        user_id_place_id: {
          user_id: userId,
          place_id: placeId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite?.id,
          user_id: userId,
        },
      });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          user_id: userId,
          place_id: placeId
        },
      });
      
      return new Favorite(favorite.id, favorite.user_id, favorite.place_id);
    }
  }
  async getByUser(userId: string): Promise<Favorite[]> {
    throw new Error("Method not implemented.");
  }
  
}
