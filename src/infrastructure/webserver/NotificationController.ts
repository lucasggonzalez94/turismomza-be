import { Request, Response } from "express";
import { PrismaNotificationRepository } from "../database/PrismaNotificationRepository";
import { ListNotifications } from "../../application/use-cases/Notification/ListNotifications";

const notificationRepository = new PrismaNotificationRepository();

const listNotifications = new ListNotifications(notificationRepository);

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
}
