import { PrismaClient } from "@prisma/client";
import { Notification } from "../../domain/entities/Notification";
import { NotificationRepository } from "../../domain/ports/NotificationRepository";

const prisma = new PrismaClient();

export class PrismaNotificationRepository implements NotificationRepository {
  async createNotification(
    userId: string,
    notification: Notification
  ): Promise<Notification> {
    const createdNotification = await prisma.notification.create({
      data: {
        userId,
        triggeredById: notification.userId,
        message: notification.message,
        type: notification.type,
      },
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
    });

    return new Notification(
      createdNotification.id,
      createdNotification.userId,
      createdNotification.type as "review" | "like",
      createdNotification.message,
      createdNotification.read,
      createdNotification.triggeredBy,
      createdNotification.creationDate
    );
  }

  async listUnreadNotifications(userId: string): Promise<Notification[]> {
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
        creationDate: "desc",
      },
    });

    return unreadNotifications.map((notification) => {
      return new Notification(
        notification.id,
        notification.userId,
        notification.type as "review" | "like",
        notification.message,
        notification.read,
        notification.triggeredBy,
        notification.creationDate
      );
    });
  }

  async listAditionalNotifications(
    userId: string,
    take: number
  ): Promise<Notification[]> {
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
        creationDate: "desc",
      },
      take,
    });

    return additionalNotifications.map((notification) => {
      return new Notification(
        notification.id,
        notification.userId,
        notification.type as "review" | "like",
        notification.message,
        notification.read,
        notification.triggeredBy,
        notification.creationDate
      );
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAsUnread(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: false },
    });
  }
}
