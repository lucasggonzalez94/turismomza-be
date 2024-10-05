import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import { validationResult } from "express-validator";
import axios from "axios";
import slugify from "slugify";

import prisma from "../prismaClient";
import { createAttractionValidator } from "../validators";
import { analyzeImage } from "../helpers";
import { verifyActiveAds } from "./advertisementsController";
import { updateAttractionValidator } from "../validators/attractions/updateAttractionValidator";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const moderateText = async (content: string) => {
  const apiKey = process.env.PERSPECTIVE_API_KEY;
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

  const response = await axios.post(url, {
    comment: { text: content },
    languages: ["es"],
    requestedAttributes: { TOXICITY: {} },
  });

  const toxicityScore =
    response.data.attributeScores.TOXICITY.summaryScore.value;
  return toxicityScore < 0.4;
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Elegir índice aleatorio
    [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
  }
  return array;
};

const generateUniqueSlug = async (title: string) => {
  const baseSlug = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let attractionExists = await prisma.attraction.findUnique({
    where: { slug },
  });
  let count = 1;

  while (attractionExists) {
    slug = `${baseSlug}-${count}`;
    attractionExists = await prisma.attraction.findUnique({
      where: { slug },
    });
    count++;
  }

  return slug;
};

export const createAttraction = [
  upload.array("images"),
  ...createAttractionValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      description,
      location,
      category,
      contactNumber,
      email,
      webSite,
      instagram,
      facebook,
      timeOpen,
      timeClose,
      price,
      currencyPrice,
    } = req.body;

    let services = [];
    if (req.body.services) {
      services = JSON.parse(req.body.services);
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    try {
      const isTextAppropriate = await moderateText(
        `Título: ${title} Descripción: ${description}`
      );
      if (!isTextAppropriate) {
        return res.status(400).json({ error: "Inappropriate text detected" });
      }

      const slug = await generateUniqueSlug(title);

      if (userRole === "viewer") {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            role: "publisher",
          },
        });
      }

      const attraction = await prisma.attraction.create({
        data: {
          title,
          slug,
          description,
          location,
          category,
          creatorId: userId,
          services,
          contactNumber,
          email,
          webSite,
          instagram,
          facebook,
          timeOpen,
          timeClose,
          price,
          currencyPrice,
        },
      });

      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files!.map((file: Express.Multer.File) => {
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

                    const savedImage = await prisma.image.create({
                      data: {
                        url: result.secure_url,
                        public_id: result.public_id,
                        attractionId: attraction.id,
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
      res.status(201).json(attraction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating attraction" });
    }
  },
];

export const listAttractions = async (req: Request, res: Response) => {
  const {
    title,
    description,
    creatorId,
    category,
    location,
    priceMin,
    priceMax,
    sponsored,
    page = 1,
    pageSize = 10,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  try {
    verifyActiveAds();

    const totalAttractions = await prisma.attraction.count({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        description: description
          ? { contains: description as string, mode: "insensitive" }
          : undefined,
        creatorId: creatorId ? { equals: creatorId as string } : undefined,
        category: category ? { equals: category as string } : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
      },
    });

    const attractions = await prisma.attraction.findMany({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        description: description
          ? { contains: description as string, mode: "insensitive" }
          : undefined,
        creatorId: creatorId ? { equals: creatorId as string } : undefined,
        category: category ? { equals: category as string } : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
      },
      include: {
        advertisements: true,
        images: {
          select: {
            url: true,
            public_id: true,
          },
        },
        comments: {
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

    const sponsoredAttractions = shuffleArray(
      attractions.filter((attraction) => {
        return attraction.advertisements.some(
          (ad) => ad.isActive && ad.endDate >= new Date()
        );
      })
    );

    if (sponsored) {
      return res.json(sponsoredAttractions);
    }

    let finalAttractions: any[] = [];
    if (sponsoredAttractions.length > 0) {
      finalAttractions.push(sponsoredAttractions[0]);
    }

    const regularAttractions = attractions
      ?.filter(
        (attraction) =>
          !sponsoredAttractions.some(
            (sponsored) => sponsored.id === attraction.id
          )
      )
      ?.map((attraction) => {
        const { advertisements, ...attractionWithoutAds } = attraction;
        return attractionWithoutAds;
      });

    const chunkSize = 6;
    let sponsoredIndex = 1;

    for (let i = 0; i < regularAttractions.length; i += chunkSize) {
      finalAttractions.push(...regularAttractions.slice(i, i + chunkSize));

      if (
        sponsoredIndex === 0 ||
        sponsoredIndex < sponsoredAttractions.length
      ) {
        finalAttractions.push(sponsoredAttractions[sponsoredIndex]);
        sponsoredIndex++;
      }
    }

    const favoriteAttractions = finalAttractions.map((attraction) => {
      const favoriteByCreator = attraction?.favorites?.some(
        (fav: any) => fav.userId === creatorId
      );
      const isFavorite = attraction.favorites.length > 0 && favoriteByCreator;
      const { favorites, ...attractionWithoutFavorites } = attraction;
      return {
        ...attractionWithoutFavorites,
        isFavorite,
      };
    });

    res.json({
      total: totalAttractions,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalAttractions / pageSizeNumber),
      data: favoriteAttractions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const listAttractionBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const attractions = await prisma.attraction.findUnique({
      where: {
        slug,
      },
      include: {
        images: {
          select: {
            url: true,
            public_id: true,
          },
        },
        comments: {
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
    });
    res.json(attractions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const listAttractionsByUser = async (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    location,
    priceMin,
    priceMax,
    page = 1,
    pageSize = 10,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  const userId = req.user!.userId;

  try {
    const totalAttractions = await prisma.attraction.count({
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
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
        creatorId: userId,
      },
    });

    const attractions = await prisma.attraction.findMany({
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
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
        creatorId: userId,
      },
      include: {
        images: {
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
      total: totalAttractions,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalAttractions / pageSizeNumber),
      data: attractions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const editAttraction = [
  upload.array("images"),
  ...updateAttractionValidator,
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
      category,
      contactNumber,
      email,
      webSite,
      instagram,
      facebook,
      timeOpen,
      timeClose,
      price,
      currencyPrice,
    } = req.body;

    let services = [];
    if (req.body.services) {
      services = JSON.parse(req.body.services);
    }

    try {
      const isTextAppropriate = await moderateText(
        `Título: ${title} Descripción: ${description}`
      );
      if (!isTextAppropriate) {
        return res.status(400).json({ error: "Inappropriate text detected" });
      }

      const existingAttraction = await prisma.attraction.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!existingAttraction) {
        return res.status(404).json({ error: "Attraction not found" });
      }

      const deleteImagePromises = existingAttraction.images.map(
        (image: { public_id: string }) => {
          return cloudinary.uploader.destroy(image.public_id);
        }
      );
      await Promise.all(deleteImagePromises);

      await prisma.image.deleteMany({
        where: { attractionId: id },
      });

      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files!.map((file: Express.Multer.File) => {
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

                    const savedImage = await prisma.image.create({
                      data: {
                        url: result.secure_url,
                        public_id: result.public_id,
                        attractionId: id,
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

      const slug = await generateUniqueSlug(title);

      const updatedAttraction = await prisma.attraction.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          location,
          category,
          creatorId: userId,
          services,
          contactNumber,
          email,
          webSite,
          instagram,
          facebook,
          timeOpen,
          timeClose,
          price,
          currencyPrice,
        },
        include: {
          images: true,
          comments: {
            include: {
              likes: userId
                ? {
                    where: { userId },
                  }
                : false,
            },
          },
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

export const deleteAttraction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const images = await prisma.image.findMany({
      where: { attractionId: id },
    });

    await Promise.all(
      images.map(async (image: { public_id: string }) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );

    await prisma.attraction.delete({
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
