import { PrismaClient } from "@prisma/client";
import { Place } from "../../domain/entities/Place";
import {
  ListPlacesFilters,
  PlaceRepository,
} from "../../domain/ports/PlaceRepository";
import { generateSlug } from "../../helpers/generateSlug";

const prisma = new PrismaClient();

export class PrismaPlaceRepository implements PlaceRepository {
  async createPlace(
    placeData: Place,
    images: { url: string; publicId: string; order: number }[]
  ): Promise<Place> {
    const newPlace = await prisma.place.create({
      data: {
        title: placeData.title,
        slug: await generateSlug(placeData.title),
        description: placeData.description,
        location: placeData.location,
        category: placeData.category,
        services: placeData.services,
        schedule: placeData.schedule,
        creatorId: placeData.creatorId,
        createdAt: new Date(),
        contactNumber: placeData.contactNumber ?? null,
        email: placeData.email ?? null,
        webSite: placeData.website ?? null,
        instagram: placeData.instagram ?? null,
        facebook: placeData.facebook ?? null,
        price: placeData.price ?? null,
        currencyPrice: placeData.currencyPrice ?? null,
        images: {
          create: images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            order: image.order,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return new Place(
      newPlace.id,
      newPlace.title,
      newPlace.slug,
      newPlace.description,
      newPlace.location,
      newPlace.category,
      newPlace.creatorId,
      newPlace.createdAt,
      newPlace.services,
      newPlace.schedule,
      newPlace.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        order: image.order,
      })),
      [],
      [],
      [],
      newPlace.contactNumber ?? undefined,
      newPlace.email ?? undefined,
      newPlace.webSite ?? undefined,
      newPlace.instagram ?? undefined,
      newPlace.facebook ?? undefined,
      newPlace.price ?? undefined,
      newPlace.currencyPrice ?? undefined
    );
  }

  async editPlace(
    placeData: {
      id: string;
      title: string;
      description: string;
      location: string;
      category: string;
      services: string[];
      contactNumber?: string;
      email?: string;
      webSite?: string;
      instagram?: string;
      facebook?: string;
      schedule: string;
      price?: number;
      currencyPrice?: "ars" | "usd";
      creatorId: string;
    },
    images: { url: string; publicId: string; order: number }[]
  ): Promise<Place> {
    // Primero, eliminamos todas las imágenes existentes para evitar duplicación
    await prisma.image.deleteMany({
      where: { placeId: placeData.id },
    });

    const newPlace = await prisma.place.update({
      where: { id: placeData.id },
      data: {
        title: placeData.title,
        slug: await generateSlug(placeData.title),
        description: placeData.description,
        location: placeData.location,
        category: placeData.category,
        services: placeData.services,
        schedule: placeData.schedule,
        creatorId: placeData.creatorId,
        contactNumber: placeData.contactNumber ?? null,
        email: placeData.email ?? null,
        webSite: placeData.webSite ?? null,
        instagram: placeData.instagram ?? null,
        facebook: placeData.facebook ?? null,
        price: placeData.price ?? null,
        currencyPrice: placeData.currencyPrice ?? null,
        images: {
          create: images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            order: image.order,
          })),
        },
      },
      include: {
        images: true,
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, name: true } },
            placeId: true,
            creationDate: true,
            likes: {
              select: {
                id: true,
                user: { select: { id: true, name: true } },
              },
            },
            reports: true,
          },
        },
        favorites: { select: { id: true, userId: true } },
        advertisements: true,
      },
    });

    return new Place(
      newPlace.id,
      newPlace.title,
      newPlace.slug,
      newPlace.description,
      newPlace.location,
      newPlace.category,
      newPlace.creatorId,
      newPlace.createdAt,
      newPlace.services,
      newPlace.schedule,
      newPlace.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        order: image.order,
      })),
      newPlace.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        userId: review.user.id,
        creationDate: review.creationDate,
        placeId: review.placeId,
      })),
      newPlace.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
      })),
      newPlace.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.placeId,
        userId: ad.userId,
        createdAt: ad.createdAt,
        startDate: ad.startDate,
        endDate: ad.endDate,
        amountPaid: ad.amountPaid,
        isActive: ad.isActive,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      newPlace.contactNumber ?? undefined,
      newPlace.email ?? undefined,
      newPlace.webSite ?? undefined,
      newPlace.instagram ?? undefined,
      newPlace.facebook ?? undefined,
      newPlace.price ?? undefined,
      newPlace.currencyPrice ?? undefined
    );
  }

  async listPlaces(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; allPlaces: Place[]; places: Place[] }> {
    const { searchTerm, categories, location, priceMin, priceMax, rating } =
      filters;
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const ratingFilter: { [key: number]: { gte: number; lt: number } } = {
      5: { gte: 4.5, lt: 5.1 },
      4: { gte: 3.5, lt: 4.5 },
      3: { gte: 2.5, lt: 3.5 },
      2: { gte: 1.5, lt: 2.5 },
      1: { gte: 0, lt: 1.5 },
    };

    const ratingRange = rating ? ratingFilter[rating] : undefined;

    const total = await prisma.place.count({
      where: {
        title: searchTerm
          ? { contains: searchTerm, mode: "insensitive" }
          : undefined,
        description: searchTerm
          ? { contains: searchTerm as string, mode: "insensitive" }
          : undefined,
        category: categories ? { in: categories } : undefined,
        location: location
          ? { contains: location, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin !== undefined && priceMin !== 0 ? priceMin : undefined,
          lte: priceMax !== undefined && priceMax !== 0 ? priceMax : undefined,
        },
        reviews: ratingRange
          ? { some: { rating: { gte: ratingRange.gte, lt: ratingRange.lt } } }
          : undefined,
      },
    });

    const places = await prisma.place.findMany({
      where: {
        title: searchTerm
          ? { contains: searchTerm, mode: "insensitive" }
          : undefined,
        description: searchTerm
          ? { contains: searchTerm as string, mode: "insensitive" }
          : undefined,
        category: categories ? { in: categories } : undefined,
        location: location
          ? { contains: location, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin !== undefined && priceMin !== 0 ? priceMin : undefined,
          lte: priceMax !== undefined && priceMax !== 0 ? priceMax : undefined,
        },
        reviews: ratingRange
          ? { some: { rating: { gte: ratingRange.gte, lt: ratingRange.lt } } }
          : undefined,
      },
      include: {
        advertisements: true,
        images: {
          select: { id: true, url: true, publicId: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            userId: true,
            placeId: true,
            creationDate: true,
            likes: { select: { userId: true } },
            reports: true,
          },
        },
        favorites: {
          select: { id: true, userId: true },
        },
      },
      skip,
      take: pageSize,
    });

    const allPlaces = await prisma.place.findMany({
      include: {
        advertisements: true,
        images: {
          select: { id: true, url: true, publicId: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            userId: true,
            placeId: true,
            creationDate: true,
            likes: { select: { userId: true } },
            reports: true,
          },
        },
        favorites: {
          select: { id: true, userId: true },
        },
      },
    });

    return {
      total,
      allPlaces: allPlaces.map((place) => {
        return new Place(
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
          place.reviews.map((review) => ({
            id: review.id,
            content: review.content,
            rating: review.rating,
            userId: review.userId,
            creationDate: review.creationDate,
            placeId: review.placeId,
          })),
          place.favorites.map((fav) => ({
            id: fav.id,
            userId: fav.userId,
          })),
          place.advertisements.map((ad) => ({
            id: ad.id,
            placeId: ad.placeId,
            userId: ad.userId,
            createdAt: ad.createdAt,
            startDate: ad.startDate,
            endDate: ad.endDate,
            amountPaid: ad.amountPaid,
            isActive: ad.isActive,
            impressions: ad.impressions,
            clicks: ad.clicks,
          })),
          place.contactNumber ?? undefined,
          place.email ?? undefined,
          place.webSite ?? undefined,
          place.instagram ?? undefined,
          place.facebook ?? undefined,
          place.price ?? undefined,
          place.currencyPrice ?? undefined
        );
      }),
      places: places.map((place) => {
        return new Place(
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
          place.reviews.map((review) => ({
            id: review.id,
            content: review.content,
            rating: review.rating,
            userId: review.userId,
            creationDate: review.creationDate,
            placeId: review.placeId,
          })),
          place.favorites.map((fav) => ({
            id: fav.id,
            userId: fav.userId,
          })),
          place.advertisements.map((ad) => ({
            id: ad.id,
            placeId: ad.placeId,
            userId: ad.userId,
            createdAt: ad.createdAt,
            startDate: ad.startDate,
            endDate: ad.endDate,
            amountPaid: ad.amountPaid,
            isActive: ad.isActive,
            impressions: ad.impressions,
            clicks: ad.clicks,
          })),
          place.contactNumber ?? undefined,
          place.email ?? undefined,
          place.webSite ?? undefined,
          place.instagram ?? undefined,
          place.facebook ?? undefined,
          place.price ?? undefined,
          place.currencyPrice ?? undefined
        );
      }),
    };
  }

  async getById(placeId: string): Promise<Place | null> {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        images: {
          select: { id: true, url: true, publicId: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, name: true } },
            placeId: true,
            creationDate: true,
            likes: {
              select: {
                id: true,
                user: { select: { id: true, name: true } },
              },
            },
            reports: true,
          },
        },
        favorites: { select: { id: true, userId: true } },
        advertisements: true,
      },
    });

    if (!place) return null;

    return new Place(
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
      place.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        userId: review.user.id,
        creationDate: review.creationDate,
        placeId: review.placeId,
      })),
      place.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
      })),
      place.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.placeId,
        userId: ad.userId,
        createdAt: ad.createdAt,
        startDate: ad.startDate,
        endDate: ad.endDate,
        amountPaid: ad.amountPaid,
        isActive: ad.isActive,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      place.contactNumber ?? undefined,
      place.email ?? undefined,
      place.webSite ?? undefined,
      place.instagram ?? undefined,
      place.facebook ?? undefined,
      place.price ?? undefined,
      place.currencyPrice ?? undefined
    );
  }

  async getBySlug(slug: string): Promise<Place | null> {
    const place = await prisma.place.findUnique({
      where: { slug },
      include: {
        images: {
          select: { id: true, url: true, publicId: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, name: true } },
            placeId: true,
            creationDate: true,
            likes: true,
            reports: true,
          },
        },
        favorites: { select: { id: true, userId: true } },
        advertisements: true,
      },
    });

    if (!place) return null;

    return new Place(
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
      place.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        user: { id: review.user.id, name: review.user.name },
        userId: review.user.id,
        creationDate: review.creationDate,
        placeId: review.placeId,
        likes: review.likes.map((like) => ({
          id: like.id,
          userId: like.userId,
          reviewId: like.reviewId,
          like: like.like,
          creationDate: like.creationDate,
        })),
      })),
      place.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.userId,
      })),
      place.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.placeId,
        userId: ad.userId,
        createdAt: ad.createdAt,
        startDate: ad.startDate,
        endDate: ad.endDate,
        amountPaid: ad.amountPaid,
        isActive: ad.isActive,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      place.contactNumber ?? undefined,
      place.email ?? undefined,
      place.webSite ?? undefined,
      place.instagram ?? undefined,
      place.facebook ?? undefined,
      place.price ?? undefined,
      place.currencyPrice ?? undefined
    );
  }

  async listFavoritePlaces(
    userId: string,
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: Place[] }> {
    const {
      searchTerm,
      categories,
      location,
      priceMin,
      priceMax,
      rating,
    } = filters;
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const ratingFilter: { [key: number]: { gte: number; lt: number } } = {
      5: { gte: 4.5, lt: 5.1 },
      4: { gte: 3.5, lt: 4.5 },
      3: { gte: 2.5, lt: 3.5 },
      2: { gte: 1.5, lt: 2.5 },
      1: { gte: 0, lt: 1.5 },
    };

    const ratingRange = rating ? ratingFilter[rating] : undefined;

    const total = await prisma.place.count({
      where: {
        title: searchTerm
          ? { contains: searchTerm, mode: "insensitive" }
          : undefined,
        description: searchTerm
          ? { contains: searchTerm as string, mode: "insensitive" }
          : undefined,
        category: categories ? { in: categories } : undefined,
        location: location
          ? { contains: location, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin !== undefined ? priceMin : undefined,
          lte: priceMax !== undefined ? priceMax : undefined,
        },
        reviews: ratingRange
          ? { some: { rating: { gte: ratingRange.gte, lt: ratingRange.lt } } }
          : undefined,
        creatorId: userId,
        favorites: {
          some: { userId },
        },
      },
    });

    const places = await prisma.place.findMany({
      where: {
        title: searchTerm
          ? { contains: searchTerm as string, mode: "insensitive" }
          : undefined,
        description: searchTerm
          ? { contains: searchTerm as string, mode: "insensitive" }
          : undefined,
        category: categories ? { in: categories } : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin ? priceMin : undefined,
          lte: priceMax ? priceMax : undefined,
        },
        creatorId: userId,
        favorites: {
          some: { userId },
        },
      },
      include: {
        advertisements: true,
        images: {
          select: { id: true, url: true, publicId: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            userId: true,
            placeId: true,
            creationDate: true,
            likes: { select: { userId: true } },
            reports: true,
          },
        },
        favorites: {
          select: { id: true, userId: true },
        },
      },
      skip,
      take: pageSize,
    });

    return {
      total,
      places: places.map((place) => {
        return new Place(
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
          place.reviews.map((review) => ({
            id: review.id,
            content: review.content,
            rating: review.rating,
            userId: review.userId,
            creationDate: review.creationDate,
            placeId: review.placeId,
          })),
          place.favorites.map((fav) => ({
            id: fav.id,
            userId: fav.userId,
          })),
          place.advertisements.map((ad) => ({
            id: ad.id,
            placeId: ad.placeId,
            userId: ad.userId,
            createdAt: ad.createdAt,
            startDate: ad.startDate,
            endDate: ad.endDate,
            amountPaid: ad.amountPaid,
            isActive: ad.isActive,
            impressions: ad.impressions,
            clicks: ad.clicks,
          })),
          place.contactNumber ?? undefined,
          place.email ?? undefined,
          place.webSite ?? undefined,
          place.instagram ?? undefined,
          place.facebook ?? undefined,
          place.price ?? undefined,
          place.currencyPrice ?? undefined
        );
      }),
    };
  }

  async deletePlace(placeId: string, userId: string): Promise<void> {
    await prisma.place.delete({
      where: { id: placeId, creatorId: userId },
    });
  }

  async getImagesByPlaceId(placeId: string): Promise<{ publicId: string }[]> {
    return prisma.image.findMany({
      where: { placeId },
      select: { publicId: true },
    });
  }
}
