import { Notification } from "../entities/Notification";

export interface NotificationRepository {
  createNotification(notification: Notification): Promise<Notification>;
  listUnreadNotifications(userId: string): Promise<Notification[]>;
  listAditionalNotifications(userId: string, take: number): Promise<Notification[]>;
}
