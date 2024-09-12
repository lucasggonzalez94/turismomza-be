import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.body;

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch {
    res.status(500).json({ error: 'Error marking notification as read' });
  }
};