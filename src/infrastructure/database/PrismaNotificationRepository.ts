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

  async listUnreadNotifications(userId: string): Promise<Notification[]> {
    const unreadNotifications = await prisma.notification.findMany({
      where: { user_id: userId, read: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        triggered_by: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        creation_date: "desc",
      },
    });

    return unreadNotifications.map((notification) => {
      return new Notification(
        notification.id,
        notification.user_id,
        notification.type as "review" | "like",
        notification.message,
        notification.read,
        notification.creation_date
      );
    });
  }

  async listAditionalNotifications(
    userId: string,
    take: number
  ): Promise<Notification[]> {
    const additionalNotifications = await prisma.notification.findMany({
      where: { user_id: userId, read: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        triggered_by: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        creation_date: "desc",
      },
      take,
    });

    return additionalNotifications.map((notification) => {
      return new Notification(
        notification.id,
        notification.user_id,
        notification.type as "review" | "like",
        notification.message,
        notification.read,
        notification.creation_date
      );
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
