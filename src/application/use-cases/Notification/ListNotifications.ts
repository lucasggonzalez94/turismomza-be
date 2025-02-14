import { Notification } from "../../../domain/entities/Notification";
import { NotificationRepository } from "../../../domain/ports/NotificationRepository";

export class ListNotifications {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<Notification[]> {
    let notifications: Notification[] = [];

    const unreadNotifications =
      await this.notificationRepository.listUnreadNotifications(userId);

    notifications = [...notifications, ...unreadNotifications];

    if (unreadNotifications.length < 10) {
      const aditionalNotifications =
        await this.notificationRepository.listAditionalNotifications(
          userId,
          10 - unreadNotifications.length
        );

      notifications = [...notifications, ...aditionalNotifications];
    }

    return notifications;
  }
}
