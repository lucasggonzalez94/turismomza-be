import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import { validationResult } from "express-validator";
import axios from "axios";

import prisma from "../prismaClient";
import { createAttractionValidator } from "../validators";
import { analyzeImage } from "../helpers";

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

const verifyActiveAds = async () => {
  const activeAdvertisements = await prisma.advertisement.findMany({
    where: {
      isActive: true,
      endDate: {
        lt: new Date(),
      },
    },
  });

  if (activeAdvertisements.length > 0) {
    const expiredAdIds = activeAdvertisements.map((ad) => ad.id);

    await prisma.advertisement.updateMany({
      where: {
        id: { in: expiredAdIds },
      },
      data: {
        isActive: false,
      },
    });
  }
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Elegir índice aleatorio
    [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
  }
  return array;
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
  try {
    const {
      title,
      description,
      creatorId,
      category,
      location,
      priceMin,
      priceMax,
    } = req.query;

    verifyActiveAds();

    const allAttractions = await prisma.attraction.findMany({
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
      },
    });

    const sponsoredAttractions = shuffleArray(
      allAttractions.filter((attraction) => {
        return attraction.advertisements.some(
          (ad) => ad.isActive && ad.endDate >= new Date()
        );
      })
    );

    const regularAttractions = allAttractions?.map((attraction) => {
      const { advertisements, ...attractionWithoutAds } = attraction;
      return attractionWithoutAds;
    });

    const finalAttractions: any[] = [];
    const chunkSize = 6;
    let sponsoredIndex = 0;

    for (let i = 0; i < regularAttractions.length; i += chunkSize) {
      finalAttractions.push(...regularAttractions.slice(i, i + chunkSize));

      if (sponsoredIndex < sponsoredAttractions.length) {
        finalAttractions.push(sponsoredAttractions[sponsoredIndex]);
        sponsoredIndex++;
      }
    }

    res.json(finalAttractions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const listAttraction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const attractions = await prisma.attraction.findUnique({
      where: {
        id,
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
  const userId = req.user!.userId;
  try {
    const attractions = await prisma.attraction.findMany({
      where: {
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
    });
    res.json(attractions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const editAttraction = [
  upload.array("images"),
  ...createAttractionValidator,
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

      const updatedAttraction = await prisma.attraction.update({
        where: { id },
        data: {
          title,
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
