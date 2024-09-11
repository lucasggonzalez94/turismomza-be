// src/controllers/atraccionesController.ts

import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import jwt from "jsonwebtoken";

export const createAttraction = async (req: Request, res: Response) => {
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
    res.status(201).json(attraction);
  } catch (error) {
    res.status(500).json({ error: "Error creating attraction" });
  }
};

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
        comments: true,
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

export const editAttraction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, location, category } = req.body;
  const userId = req.user?.userId;

  try {
    const attraction = await prisma.attraction.update({
      where: {
        id,
        creatorId: userId,
      },
      data: {
        title,
        description,
        location,
        category,
      },
    });
    res.json(attraction);
  } catch (error) {
    res.status(500).json({ error: "Error updating attraction" });
  }
};

export const deleteAttraction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    await prisma.attraction.delete({
      where: {
        id,
        creatorId: userId,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting attraction" });
  }
};
