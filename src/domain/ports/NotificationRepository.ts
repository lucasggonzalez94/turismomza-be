import { Notification } from "../entities/Notification";

export interface NotificationRepository {
  createNotification(notification: Notification): Promise<Notification>;
}
