import { Request, Response } from "express";
import { PrismaNotificationRepository } from "../database/PrismaNotificationRepository";
import { ListNotifications } from "../../application/use-cases/Notification/ListNotifications";
import { MarkAsRead } from "../../application/use-cases/Notification/MarkAsRead";

const notificationRepository = new PrismaNotificationRepository();

const listNotifications = new ListNotifications(notificationRepository);
const markAsRead = new MarkAsRead(notificationRepository);

export class NotificationsController {
  static async list(req: Request, res: Response) {
    const userId = req.user?.userId;

    try {
      const notifications = await listNotifications.execute(userId);

      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Error fetching notifications" });
    }
  }
  
  static async markAsRead(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await markAsRead.execute(id);

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Error marking notification as read" });
    }
  }
}
