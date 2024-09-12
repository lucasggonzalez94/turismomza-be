// src/controllers/atraccionesController.ts

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";

import prisma from "../prismaClient";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createAttraction = [
  upload.array("images"),
  async (req: Request, res: Response) => {
    // TODO: Validar categorias
    const { title, description, location, category } = req.body;
    const userId = req.user!.userId;

    try {
      const attraction = await prisma.attraction.create({
        data: {
          title,
          description,
          location,
          category,
          creatorId: userId,
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
      res.status(500).json({ error: "Error creating attraction" });
    }
  },
];

export const listAttractions = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!!token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (_, decoded) => {
        if (decoded && typeof decoded !== "string") {
          req.user = {
            userId: decoded.userId,
            role: decoded.role,
          };
        }
      }
    );
  }
  const userId = req?.user?.userId;

  try {
    const attractions = await prisma.attraction.findMany({
      include: {
        images: true,
        comments: {
          include: {
            likesDislikes: userId
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
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ error: "Error listing attractions" });
  }
};

export const editAttraction = [
  upload.array("images"),
  async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, location, category = [] } = req.body;

  try {
    const existingAttraction = await prisma.attraction.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existingAttraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    const deleteImagePromises = existingAttraction.images.map(image => {
      return cloudinary.uploader.destroy(image.public_id);
    });
    await Promise.all(deleteImagePromises);

    await prisma.image.deleteMany({
      where: { attractionId: id }
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

    const updatedAttraction = await prisma.attraction.findUnique({
      where: { id },
      include: { images: true }
    });

    res.json(updatedAttraction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating attraction' });
  }
}];

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
        await prisma.image.delete({ where: { id: image.id } });
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
    console.log(error)
    res.status(500).json({ error: "Error deleting attraction" });
  }
};
