import { PrismaClient } from "@prisma/client";
import { Place } from "../../domain/entities/Place";
import { PlaceRepository } from "../../domain/ports/PlaceRepository";
import { generateSlug } from "../../helpers/generateSlug";

const prisma = new PrismaClient();

export class PrismaPlaceRepository implements PlaceRepository {
  async create(
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
}
