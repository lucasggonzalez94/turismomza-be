import { PrismaClient } from "@prisma/client";
import { Notification } from "../../domain/entities/Notification";
import { NotificationRepository } from "../../domain/ports/NotificationRepository";

const prisma = new PrismaClient();

export class PrismaNotificationRepository implements NotificationRepository {
  async createNotification(notification: Notification): Promise<Notification> {
    const createdNotification = await prisma.notification.create({
      data: {
        user_id: notification.userId,
        triggeredBy_id: notification.userId,
        message: notification.message,
        type: notification.type,
      },
    });

    return new Notification(
      createdNotification.id,
      createdNotification.user_id,
      createdNotification.type as "review" | "like",
      createdNotification.message,
      createdNotification.read,
      createdNotification.creation_date
    );
  }
}
