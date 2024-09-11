// src/controllers/atraccionesController.ts

import { Request, Response } from 'express';
import prisma from '../prismaClient';

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
    res.status(500).json({ error: 'Error creating attraction' });
  }
};

export const listAttractions = async (_: Request, res: Response) => {
  try {
    const attractions = await prisma.attraction.findMany();
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ error: 'Error listing attractions' });
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
    res.status(500).json({ error: 'Error updating attraction' });
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
    res.status(500).json({ error: 'Error deleting attraction' });
  }
};
