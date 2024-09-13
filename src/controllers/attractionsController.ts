// src/controllers/atraccionesController.ts

import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import { body, validationResult } from "express-validator";

import prisma from "../prismaClient";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createAttraction = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("recomended")
    .optional()
    .isString()
    .withMessage("Recomended must be a string"),
  body("services").isArray().withMessage("Services must be an array"),
  body("contactNumber")
    .optional()
    .isString()
    .withMessage("Contact number must be a string"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("webSite").optional().isURL().withMessage("Please enter a valid URL"),
  body("instagram")
    .optional()
    .isString()
    .withMessage("Instagram must be a string"),
  body("facebook")
    .optional()
    .isString()
    .withMessage("Facebook must be a string"),
  body("timeOpen")
    .optional()
    .isString()
    .withMessage("Time Open must be a string"),
  body("timeClose")
    .optional()
    .isString()
    .withMessage("Time Close must be a string"),
  body("duration")
    .optional()
    .isString()
    .withMessage("Duration must be a string"),
  body("minAge")
    .toInt()
    .optional()
    .isInt({ min: 0 })
    .withMessage("Min age must be a valid number"),
  body("maxPersons")
    .toInt()
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max persons must be a valid number"),
  body("price")
    .toFloat()
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a valid number"),
  upload.array("images"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // TODO: Validar categorias
    const {
      title,
      description,
      location,
      category,
      recomended,
      services,
      contactNumber,
      email,
      webSite,
      instagram,
      facebook,
      timeOpen,
      timeClose,
      duration,
      minAge,
      maxPersons,
      price,
    } = req.body;
    const userId = req.user!.userId;

    try {
      const attraction = await prisma.attraction.create({
        data: {
          title,
          description,
          location,
          category,
          creatorId: userId,
          recomended,
          services,
          contactNumber,
          email,
          webSite,
          instagram,
          facebook,
          timeOpen,
          timeClose,
          duration,
          minAge,
          maxPersons,
          price,
        },
      });
      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                async (error, result) => {
                  if (error) {
                    reject(new Error("Error uploading image to Cloudinary"));
                  } else if (result) {
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

// TODO: Agregar filtros
export const listAttractions = async (_: Request, res: Response) => {
  try {
    const attractions = await prisma.attraction.findMany({
      include: {
        images: true,
        ratings: true,
      },
    });
    res.json(attractions);
  } catch {
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
        images: true,
        ratings: true,
      },
    });
    res.json(attractions);
  } catch {
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const editAttraction = [
  upload.array("images"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, location, category = [] } = req.body;

    try {
      const existingAttraction = await prisma.attraction.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!existingAttraction) {
        return res.status(404).json({ error: "Attraction not found" });
      }

      const deleteImagePromises = existingAttraction.images.map((image) => {
        return cloudinary.uploader.destroy(image.public_id);
      });
      await Promise.all(deleteImagePromises);

      await prisma.image.deleteMany({
        where: { attractionId: id },
      });

      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                async (error, result) => {
                  if (error) {
                    reject(new Error("Error uploading image to Cloudinary"));
                  } else if (result) {
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
          ratings: userId
            ? {
                where: { userId },
              }
            : false,
          favorites: userId
            ? {
                where: { userId },
              }
            : false,
        },
      });

      res.json(updatedAttraction);
    } catch {
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
      images.map(async (image) => {
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
  } catch {
    res.status(500).json({ error: "Error deleting attraction" });
  }
};
