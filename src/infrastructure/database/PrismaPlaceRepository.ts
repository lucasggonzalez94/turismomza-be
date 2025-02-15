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
    placeData: {
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
    const newPlace = await prisma.place.create({
      data: {
        title: placeData.title,
        slug: await generateSlug(placeData.title),
        description: placeData.description,
        location: placeData.location,
        category: placeData.category,
        services: placeData.services,
        schedule: placeData.schedule,
        creator_id: placeData.creatorId,
        created_at: new Date(),
        contact_number: placeData.contactNumber ?? null,
        email: placeData.email ?? null,
        webSite: placeData.webSite ?? null,
        instagram: placeData.instagram ?? null,
        facebook: placeData.facebook ?? null,
        price: placeData.price ?? null,
        currency_price: placeData.currencyPrice ?? null,
        images: {
          create: images.map((image) => ({
            url: image.url,
            public_id: image.publicId,
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
      newPlace.creator_id,
      newPlace.created_at,
      newPlace.services,
      newPlace.schedule,
      newPlace.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.public_id,
        order: image.order,
      })),
      [],
      [],
      [],
      newPlace.contact_number ?? undefined,
      newPlace.email ?? undefined,
      newPlace.webSite ?? undefined,
      newPlace.instagram ?? undefined,
      newPlace.facebook ?? undefined,
      newPlace.price ?? undefined,
      newPlace.currency_price ?? undefined
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
        creator_id: placeData.creatorId,
        contact_number: placeData.contactNumber ?? null,
        email: placeData.email ?? null,
        webSite: placeData.webSite ?? null,
        instagram: placeData.instagram ?? null,
        facebook: placeData.facebook ?? null,
        price: placeData.price ?? null,
        currency_price: placeData.currencyPrice ?? null,
        images: {
          create: images.map((image) => ({
            url: image.url,
            public_id: image.publicId,
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
            place_id: true,
            creation_date: true,
            likes: {
              select: {
                id: true,
                user: { select: { id: true, name: true } },
              },
            },
            reports: true,
          },
        },
        favorites: { select: { id: true, user_id: true } },
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
      newPlace.creator_id,
      newPlace.created_at,
      newPlace.services,
      newPlace.schedule,
      newPlace.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.public_id,
        order: image.order,
      })),
      newPlace.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        userId: review.user.id,
        creationDate: review.creation_date,
        placeId: review.place_id,
      })),
      newPlace.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.user_id,
      })),
      newPlace.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.place_id,
        userId: ad.user_id,
        createdAt: ad.created_at,
        startDate: ad.start_date,
        endDate: ad.end_date,
        amountPaid: ad.amount_paid,
        isActive: ad.is_active,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      newPlace.contact_number ?? undefined,
      newPlace.email ?? undefined,
      newPlace.webSite ?? undefined,
      newPlace.instagram ?? undefined,
      newPlace.facebook ?? undefined,
      newPlace.price ?? undefined,
      newPlace.currency_price ?? undefined
    );
  }

  async listPlaces(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: any[] }> {
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
          gte: priceMin !== undefined ? priceMin : undefined,
          lte: priceMax !== undefined ? priceMax : undefined,
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
          gte: priceMin !== undefined ? priceMin : undefined,
          lte: priceMax !== undefined ? priceMax : undefined,
        },
        reviews: ratingRange
          ? { some: { rating: { gte: ratingRange.gte, lt: ratingRange.lt } } }
          : undefined,
      },
      include: {
        advertisements: true,
        images: {
          select: { url: true, public_id: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { name: true } },
            creation_date: true,
            likes: { select: { user_id: true } },
            reports: true,
          },
        },
        favorites: {
          select: { id: true, user_id: true },
        },
      },
      skip,
      take: pageSize,
    });

    return { total, places };
  }

  async getById(placeId: string): Promise<Place | null> {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        images: {
          select: { id: true, url: true, public_id: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, name: true } },
            place_id: true,
            creation_date: true,
            likes: {
              select: {
                id: true,
                user: { select: { id: true, name: true } },
              },
            },
            reports: true,
          },
        },
        favorites: { select: { id: true, user_id: true } },
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
      place.creator_id,
      place.created_at,
      place.services,
      place.schedule,
      place.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.public_id,
        order: image.order,
      })),
      place.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        userId: review.user.id,
        creationDate: review.creation_date,
        placeId: review.place_id,
      })),
      place.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.user_id,
      })),
      place.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.place_id,
        userId: ad.user_id,
        createdAt: ad.created_at,
        startDate: ad.start_date,
        endDate: ad.end_date,
        amountPaid: ad.amount_paid,
        isActive: ad.is_active,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      place.contact_number ?? undefined,
      place.email ?? undefined,
      place.webSite ?? undefined,
      place.instagram ?? undefined,
      place.facebook ?? undefined,
      place.price ?? undefined,
      place.currency_price ?? undefined
    );
  }

  async getBySlug(slug: string): Promise<Place | null> {
    const place = await prisma.place.findUnique({
      where: { slug },
      include: {
        images: {
          select: { id: true, url: true, public_id: true, order: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, name: true } },
            place_id: true,
            creation_date: true,
            likes: true,
            reports: true,
          },
        },
        favorites: { select: { id: true, user_id: true } },
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
      place.creator_id,
      place.created_at,
      place.services,
      place.schedule,
      place.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.public_id,
        order: image.order,
      })),
      place.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        user: { id: review.user.id, name: review.user.name },
        userId: review.user.id,
        creationDate: review.creation_date,
        placeId: review.place_id,
        likes: review.likes.map((like) => ({
          id: like.id,
          userId: like.user_id,
          reviewId: like.review_id,
          like: like.like,
          creationDate: like.creation_date,
        })),
      })),
      place.favorites.map((fav) => ({
        id: fav.id,
        userId: fav.user_id,
      })),
      place.advertisements.map((ad) => ({
        id: ad.id,
        placeId: ad.place_id,
        userId: ad.user_id,
        createdAt: ad.created_at,
        startDate: ad.start_date,
        endDate: ad.end_date,
        amountPaid: ad.amount_paid,
        isActive: ad.is_active,
        impressions: ad.impressions,
        clicks: ad.clicks,
      })),
      place.contact_number ?? undefined,
      place.email ?? undefined,
      place.webSite ?? undefined,
      place.instagram ?? undefined,
      place.facebook ?? undefined,
      place.price ?? undefined,
      place.currency_price ?? undefined
    );
  }

  async listPlacesByUser(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: any[] }> {
    const {
      searchTerm,
      creatorId,
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
        creator_id: creatorId,
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
        creator_id: creatorId,
      },
      include: {
        images: {
          select: {
            url: true,
            public_id: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      skip,
      take: pageSize,
    });

    return { total, places };
  }

  async deletePlace(placeId: string, userId: string): Promise<void> {
    await prisma.place.delete({
      where: { id: placeId, creator_id: userId },
    });
  }

  async getImagesByPlaceId(placeId: string): Promise<{ public_id: string }[]> {
    return prisma.image.findMany({
      where: { place_id: placeId },
      select: { public_id: true },
    });
  }
}
