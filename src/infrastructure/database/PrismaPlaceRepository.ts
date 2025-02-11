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

  async listPlaces(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: any[] }> {
    const { title, categories, location, priceMin, priceMax, rating } = filters;
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
        title: title ? { contains: title, mode: "insensitive" } : undefined,
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
        title: title ? { contains: title, mode: "insensitive" } : undefined,
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
}
