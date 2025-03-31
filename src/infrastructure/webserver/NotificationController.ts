import { Request, Response } from "express";
import { PrismaNotificationRepository } from "../database/PrismaNotificationRepository";
import { ListNotifications } from "../../application/use-cases/Notification/ListNotifications";
import { MarkAsRead } from "../../application/use-cases/Notification/MarkAsRead";
import { MarkAsUnread } from "../../application/use-cases/Notification/MarkAsUnread";

const notificationRepository = new PrismaNotificationRepository();

const listNotifications = new ListNotifications(notificationRepository);
const markAsRead = new MarkAsRead(notificationRepository);
const markAsUnread = new MarkAsUnread(notificationRepository);

export class NotificationsController {
  static async list(req: Request, res: Response) {
    const userId = req.user?.userId;

    try {
      const notifications = await listNotifications.execute(userId as string);

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
  
  static async markAsUnread(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await markAsUnread.execute(id);

      res.status(200).json({ message: "Notification marked as unread" });
    } catch (error) {
      res.status(500).json({ error: "Error marking notification as unread" });
    }
  }
}
