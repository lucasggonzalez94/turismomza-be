import { Notification } from "../entities/Notification";

export interface NotificationRepository {
  createNotification(notification: Notification): Promise<Notification>;
  listUnreadNotifications(userId: string): Promise<Notification[]>;
  listAditionalNotifications(userId: string, take: number): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  // TODO: Implementar metodo para marcar notificaciones como no leidas
}
