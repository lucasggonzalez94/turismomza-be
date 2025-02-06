import { Request, Response } from "express";
import prisma from "../User/infrastructure/database/prismaClient";
import { validationResult } from "express-validator";
import { markAsReadValidator } from "../validators";

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const unreadNotifications = await prisma.notification.findMany({
      where: { userId, read: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        creation_date: "desc",
      },
    });

    let notifications = unreadNotifications;

    if (unreadNotifications.length < 10) {
      const additionalNotifications = await prisma.notification.findMany({
        where: { userId, read: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          triggeredBy: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          creation_date: "desc",
        },
        take: 10 - unreadNotifications.length,
      });

      notifications = [...unreadNotifications, ...additionalNotifications];
    }

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

export const markAsRead = [
  ...markAsReadValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { notificationId } = req.body;

    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error marking notification as read" });
    }
  },
];
