import { PrismaClient } from "@prisma/client";
import { FavoriteRepository } from "../../domain/ports/FavoriteRepository";
import { Favorite } from "../../domain/entities/Favorite";
import { Place } from "../../domain/entities/Place";

const prisma = new PrismaClient();

export class PrismaFavoriteRepository implements FavoriteRepository {
  async addOrRemove(placeId: string, userId: string): Promise<Favorite | void> {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId,
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
          placeId,
        },
      });

      return new Favorite(favorite.id, favorite.userId, favorite.placeId);
    }
  }
  async getByUser(
    userId: string,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: Place[] }> {
    const { page, pageSize } = pagination;
    const pageNumber = page || 1;
    const pageSizeNumber = pageSize || 10;
    const skip = (pageNumber - 1) * pageSizeNumber;

    const totalPlaces = await prisma.favorite.count({
      where: {
        userId,
      },
    });

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        place: {
          include: {
            images: true,
            reviews: {
              select: {
                content: true,
                rating: true,
                user: {
                  select: {
                    name: true,
                  },
                },
                creationDate: true,
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
    });

    const favoritePlaces = favorites.map((favorite) => favorite.place);

    return {
      total: totalPlaces,
      places: favoritePlaces.map(
        (place) =>
          new Place(
            place.id,
            place.title,
            place.slug,
            place.description,
            place.location,
            place.category,
            place.creatorId,
            place.createdAt,
            place.services,
            place.schedule,
            place.images.map((image) => ({
              id: image.id,
              url: image.url,
              publicId: image.publicId,
              order: image.order,
            })),
            [],
            [],
            [],
            place.contactNumber ?? undefined,
            place.email ?? undefined,
            place.webSite ?? undefined,
            place.instagram ?? undefined,
            place.facebook ?? undefined,
            place.price ?? undefined,
            place.currencyPrice ?? undefined
          )
      ),
    };
  }
}
