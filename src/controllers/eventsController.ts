import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import { validationResult } from "express-validator";

import prisma from "../prismaClient";
import { verifyActiveAds } from "./advertisementsController";
import {
  analyzeImage,
  generateUniqueSlug,
  moderateText,
  shuffleArray,
} from "../utils/helpers";
import { createEventValidator } from "../validators/events/createEventValidator";
import { updateEventValidator } from "../validators/events/updateEventValidator";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createEvent = [
  upload.array("images"),
  ...createEventValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      location,
      place,
      category,
      minAge,
      webSite,
      startTime,
      eventDate,
    } = req.body;

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const cloudinaryPublicIds: string[] = [];

    try {
      const isTextAppropriate = await moderateText(
        `Título: ${title} Descripción: ${description}`
      );
      if (!isTextAppropriate) {
        return res.status(406).json({ error: "Inappropriate text detected" });
      }

      const slug = await generateUniqueSlug(title);

      if (userRole === "viewer") {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "publisher" },
        });
      }

      type UploadedImage = { url: string; public_id: string; order: number };
      const uploadedImages: UploadedImage[] = [];

      if (Array.isArray(req.files) && req.files.length > 0) {
        for (const [index, file] of req.files.entries()) {
          const uploadStream = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image" },
              (error, result) => {
                if (error) {
                  reject(new Error("Error uploading image to Cloudinary"));
                } else {
                  resolve(result);
                }
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });

          if (uploadStream && uploadStream.secure_url) {
            cloudinaryPublicIds.push(uploadStream.public_id);
            const isImageAppropriate = await analyzeImage(
              uploadStream.secure_url
            );
            if (!isImageAppropriate) {
              await Promise.all(
                cloudinaryPublicIds.map((publicId) =>
                  cloudinary.uploader.destroy(publicId)
                )
              );
              return res
                .status(406)
                .json({ error: "Inappropriate image detected" });
            }
            uploadedImages.push({
              url: uploadStream.secure_url,
              public_id: uploadStream.public_id,
              order: index,
            });
          }
        }
      }

      const event = await prisma.$transaction(async (prisma) => {
        const newEvent = await prisma.event.create({
          data: {
            title,
            slug,
            description,
            location,
            place,
            category,
            creatorId: userId,
            webSite,
            minAge,
            start_time: startTime,
            event_date: eventDate,
            imageEventId: uploadedImages[0].public_id,
          },
        });

        for (const image of uploadedImages) {
          await prisma.imageEvent.create({
            data: {
              url: image.url,
              public_id: image.public_id,
            },
          });
        }

        return newEvent;
      });

      res.status(201).json(event);
    } catch (error) {
      console.error(error);

      if (cloudinaryPublicIds.length > 0) {
        await Promise.all(
          cloudinaryPublicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId)
          )
        );
      }

      res.status(500).json({ error: "Error creating attraction" });
    }
  },
];

export const listEvents = async (req: Request, res: Response) => {
  const {
    title,
    creatorId,
    categories,
    sponsored,
    date,
    minAge,
    page = 1,
    pageSize = 10,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  try {
    verifyActiveAds();

    const eventFilters: any = {
      title: title
        ? { contains: title as string, mode: "insensitive" }
        : undefined,
      creatorId: creatorId ? (creatorId as string) : undefined,
      category: categories
        ? {
            in: Array.isArray(categories)
              ? categories.map((cat) => cat as string)
              : [categories as string],
          }
        : undefined,
      minAge: minAge ? { gte: parseInt(minAge as string, 10) } : undefined,
      event_date: date ? { gte: new Date(date as string) } : undefined,
      advertisements: sponsored
        ? {
            some: {
              isActive: true,
              endDate: { gte: new Date() },
            },
          }
        : undefined,
    };

    const filteredEventFilters = Object.fromEntries(
      Object.entries(eventFilters).filter(([_, v]) => v !== undefined)
    );

    const totalEvents = await prisma.event.count({
      where: filteredEventFilters,
    });

    const events = await prisma.event.findMany({
      where: filteredEventFilters,
      include: {
        advertisements: true,
        image: {
          select: {
            url: true,
            public_id: true,
          },
        },
        favorites: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      skip,
      take: pageSizeNumber,
    });

    const sponsoredEvents = shuffleArray(
      events.filter((event) => {
        return event.advertisements.some(
          (ad) => ad.isActive && ad.endDate >= new Date()
        );
      })
    );

    if (sponsored) {
      return res.json(sponsoredEvents);
    }

    let finalEvents: any[] = [];
    if (sponsoredEvents.length > 0) {
      finalEvents.push(sponsoredEvents[0]);
    }

    const regularEvents = events
      ?.filter(
        (event) =>
          !sponsoredEvents.some((sponsored) => sponsored.id === event.id)
      )
      ?.map((event) => {
        const { advertisements, ...eventWithoutAds } = event;
        return eventWithoutAds;
      });

    const chunkSize = 6;
    let sponsoredIndex = 1;

    for (let i = 0; i < regularEvents.length; i += chunkSize) {
      finalEvents.push(...regularEvents.slice(i, i + chunkSize));

      if (sponsoredIndex === 0 || sponsoredIndex < sponsoredEvents.length) {
        finalEvents.push(sponsoredEvents[sponsoredIndex]);
        sponsoredIndex++;
      }
    }

    const favoriteEvents = finalEvents.map((event) => {
      const favoriteByCreator = event?.favorites?.some(
        (fav: any) => fav.userId === creatorId
      );
      const isFavorite = event.favorites.length > 0 && favoriteByCreator;
      const { favorites, ...eventWithoutFavorites } = event;
      return {
        ...eventWithoutFavorites,
        isFavorite,
      };
    });

    res.json({
      total: totalEvents,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalEvents / pageSizeNumber),
      data: favoriteEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing events" });
  }
};

export const listEventBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { userId } = req.query;

  try {
    const event = await prisma.event.findUnique({
      where: {
        slug,
      },
      include: {
        image: {
          select: {
            url: true,
            public_id: true,
          },
        },
        favorites: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (event) {
      const favoriteByCreator = event?.favorites?.some(
        (fav: any) => fav.userId === userId
      );
      const isFavorite = event.favorites.length > 0 && favoriteByCreator;
      const { favorites, ...eventWithoutFavorites } = event;
      return res.json({
        ...eventWithoutFavorites,
        isFavorite,
      });
    }

    res.status(404).json({ error: "Error finding attraction" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error service" });
  }
};

export const listEventsByUser = async (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    location,
    event_date,
    minAge,
    page = 1,
    pageSize = 10,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  const userId = req.user!.userId;

  try {
    const totalEvents = await prisma.event.count({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        description: description
          ? { contains: description as string, mode: "insensitive" }
          : undefined,
        category: category ? { equals: category as string } : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        event_date: event_date
          ? { gte: new Date(event_date as string) }
          : undefined,
        minAge: minAge ? { gte: parseInt(minAge as string, 10) } : undefined,
        creatorId: userId,
      },
    });

    const events = await prisma.event.findMany({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        description: description
          ? { contains: description as string, mode: "insensitive" }
          : undefined,
        category: category ? { equals: category as string } : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        event_date: event_date
          ? { gte: new Date(event_date as string) }
          : undefined,
        minAge: minAge ? { gte: parseInt(minAge as string, 10) } : undefined,
        creatorId: userId,
      },
      include: {
        advertisements: true,
        image: {
          select: {
            url: true,
            public_id: true,
          },
        },
      },
      skip,
      take: pageSizeNumber,
    });

    res.json({
      total: totalEvents,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalEvents / pageSizeNumber),
      data: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing events" });
  }
};

export const editEvent = [
  upload.array("images"),
  ...updateEventValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.userId;
    const {
      title,
      description,
      location,
      place,
      category,
      minAge,
      webSite,
      startTime,
      eventDate,
    } = req.body;

    try {
      const isTextAppropriate = await moderateText(
        `Título: ${title} Descripción: ${description}`
      );
      if (!isTextAppropriate) {
        return res.status(400).json({ error: "Inappropriate text detected" });
      }

      const existingEvent = await prisma.event.findUnique({
        where: { id },
        include: { image: true },
      });

      if (!existingEvent) {
        return res.status(404).json({ error: "Attraction not found" });
      }

      await cloudinary.uploader.destroy(existingEvent.image.public_id);

      await prisma.image.deleteMany({
        where: { attractionId: id },
      });

      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files!.map((file: Express.Multer.File, index: number) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                async (error, result) => {
                  if (error) {
                    reject(new Error("Error uploading image to Cloudinary"));
                  } else if (result) {
                    const isImageAppropriate = await analyzeImage(
                      result.secure_url
                    );
                    if (isImageAppropriate) {
                      return res
                        .status(400)
                        .json({ error: "Inappropriate image detected" });
                    }

                    const savedImage = await prisma.imageEvent.create({
                      data: {
                        url: result.secure_url,
                        public_id: result.public_id,
                      },
                    });
                    resolve(savedImage);
                  }
                }
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
          })
        );
      }

      if (title) {
        const slug = await generateUniqueSlug(title);

        await prisma.event.update({
          where: { id },
          data: {
            slug,
          },
        });
      }

      const updatedAttraction = await prisma.event.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          location,
          place,
          category,
          creatorId: userId,
          webSite,
          minAge,
          start_time: startTime,
          event_date: eventDate,
          imageEventId: uploadedImages[0].public_id,
        },
        include: {
          image: true,
          favorites: userId
            ? {
                where: { userId },
              }
            : false,
        },
      });

      res.json(updatedAttraction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating attraction" });
    }
  },
];

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const image = await prisma.imageEvent.findMany({
      where: { eventId: id },
    });

    await Promise.all(
      image.map(async (image: { public_id: string }) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );

    await prisma.event.delete({
      where: {
        id,
        creatorId: userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting attraction" });
  }
};
