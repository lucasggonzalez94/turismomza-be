import { Request, Response } from "express";
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
import { Attraction } from "@prisma/client";

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

const getMaxMinPrices = (attractions: Attraction[]) => {
  const prices = attractions
    .map((attranction) => attranction.price)
    .filter((price) => price !== null && price !== undefined);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return { maxPrice, minPrice };
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
      schedule,
      price,
      currencyPrice,
    } = req.body;

    let services = [];
    if (req.body.services) {
      services = JSON.parse(req.body.services);
    }

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

      const attraction = await prisma.$transaction(async (prisma) => {
        const newAttraction = await prisma.attraction.create({
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
            schedule,
            price,
            currencyPrice,
          },
        });

        for (const image of uploadedImages) {
          await prisma.image.create({
            data: {
              url: image.url,
              public_id: image.public_id,
              attractionId: newAttraction.id,
              order: image.order,
            },
          });
        }

        return newAttraction;
      });

      res.status(201).json(attraction);
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

export const listAttractions = async (req: Request, res: Response) => {
  const {
    title,
    creatorId,
    categories,
    location,
    priceMin,
    priceMax,
    sponsored,
    rating,
    page = 1,
    pageSize = 10,
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  const ratingFilter = {
    5: { gte: 4.5, lt: 5.1 },
    4: { gte: 3.5, lt: 4.5 },
    3: { gte: 2.5, lt: 3.5 },
    2: { gte: 1.5, lt: 2.5 },
    1: { gte: 0, lt: 1.5 },
  };

  const ratingRange = rating
    ? ratingFilter[parseInt(rating as string, 10) as keyof typeof ratingFilter]
    : undefined;

  try {
    verifyActiveAds();

    const totalAttractions = await prisma.attraction.count({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        category: categories
          ? {
              in: Array.isArray(categories)
                ? categories.map((cat) => cat as string)
                : [categories as string],
            }
          : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
        reviews: ratingRange
          ? {
              some: {
                rating: {
                  gte: ratingRange.gte,
                  lt: ratingRange.lt,
                },
              },
            }
          : undefined,
      },
    });

    const attractions = await prisma.attraction.findMany({
      where: {
        title: title
          ? { contains: title as string, mode: "insensitive" }
          : undefined,
        category: categories
          ? {
              in: Array.isArray(categories)
                ? categories.map((cat) => cat as string)
                : [categories as string],
            }
          : undefined,
        location: location
          ? { contains: location as string, mode: "insensitive" }
          : undefined,
        price: {
          gte: priceMin ? parseFloat(priceMin as string) : undefined,
          lte: priceMax ? parseFloat(priceMax as string) : undefined,
        },
        reviews: ratingRange
          ? {
              some: {
                rating: {
                  gte: ratingRange.gte,
                  lt: ratingRange.lt,
                },
              },
            }
          : undefined,
      },
      include: {
        advertisements: true,
        images: {
          select: {
            url: true,
            public_id: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        reviews: {
          select: {
            id: true,
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
                userId: true,
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

    const attractionsWithRating = attractions.map((attraction) => {
      const totalRatings = attraction.reviews.length;
      const sumRatings = attraction.reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );

      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      return {
        ...attraction,
        avgRating,
      };
    });

    const sponsoredAttractions = shuffleArray(
      attractionsWithRating.filter((attraction) => {
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

    const regularAttractions = attractionsWithRating
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

    const { minPrice, maxPrice } = getMaxMinPrices(favoriteAttractions);

    res.json({
      total: totalAttractions,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalAttractions / pageSizeNumber),
      minPrice,
      maxPrice,
      data: favoriteAttractions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const listAttractionBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { userId } = req.query;

  try {
    const attraction = await prisma.attraction.findUnique({
      where: {
        slug,
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
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            creation_date: true,
            likes: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
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
    });

    if (attraction) {
      const favoriteByCreator = attraction?.favorites?.some(
        (fav: any) => fav.userId === userId
      );
      const isFavorite = attraction.favorites.length > 0 && favoriteByCreator;
      const { favorites, ...attractionWithoutFavorites } = attraction;
      return res.json({
        ...attractionWithoutFavorites,
        isFavorite,
      });
    }

    res.status(404).json({ error: "Error finding attraction" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error service" });
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
          orderBy: {
            order: "asc",
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
      schedule,
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
                    if (!isImageAppropriate) {
                      return res
                        .status(400)
                        .json({ error: "Inappropriate image detected" });
                    }

                    const savedImage = await prisma.image.create({
                      data: {
                        url: result.secure_url,
                        public_id: result.public_id,
                        attractionId: id,
                        order: index,
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

        await prisma.attraction.update({
          where: { id },
          data: {
            slug,
          },
        });
      }

      const updatedAttraction = await prisma.attraction.update({
        where: { id },
        data: {
          title,
          description,
          location,
          category,
          services,
          contactNumber,
          email,
          webSite,
          instagram,
          facebook,
          schedule,
          price,
          currencyPrice,
        },
        include: {
          images: true,
          reviews: {
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
