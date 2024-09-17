import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { createAdvertisementValidator } from "../validators";
import { updateAdvertisementValidator } from "../validators/advertisements/updateAdvertisementValidator";

const prisma = new PrismaClient();

export const createAdvertisement = [
  ...createAdvertisementValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.userId;

    const { attractionId, startDate, endDate, amountPaid } = req.body;

    try {
      const advertisement = await prisma.advertisement.create({
        data: {
          attractionId,
          userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          amountPaid,
        },
      });
      res.status(201).json(advertisement);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating advertisement" });
    }
  },
];

export const updateAdvertisement = [
  ...updateAdvertisementValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { startDate, endDate, amountPaid, isActive } = req.body;

    try {
      const advertisement = await prisma.advertisement.update({
        where: { id },
        data: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          amountPaid,
          isActive,
        },
      });
      res.json(advertisement);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating advertisement" });
    }
  },
];

export const listAdvertisements = async (req: Request, res: Response) => {
  const { isActive, startDate, endDate, userId } = req.query;

  try {
    const advertisements = await prisma.advertisement.findMany({
      where: {
        isActive: Boolean(isActive),
        startDate: startDate
          ? { gte: new Date(startDate as string) }
          : undefined,
        endDate: endDate ? { lte: new Date(startDate as string) } : undefined,
        userId: userId ? { equals: userId as string } : undefined,
      },
    });
    res.json(advertisements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing advertisements" });
  }
};

export const listAdvertisementsByUser = async (req: Request, res: Response) => {
  const { isActive, startDate, endDate } = req.query;
  const { userId } = req.params;

  try {
    const advertisements = await prisma.advertisement.findMany({
      where: {
        isActive: Boolean(isActive),
        startDate: startDate
          ? { gte: new Date(startDate as string) }
          : undefined,
        endDate: endDate ? { lte: new Date(startDate as string) } : undefined,
        userId
      },
    });
    res.json(advertisements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing advertisements" });
  }
};

export const deleteAdvertisement = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.advertisement.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting advertisement" });
  }
};
