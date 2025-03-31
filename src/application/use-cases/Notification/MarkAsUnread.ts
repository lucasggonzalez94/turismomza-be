import { NotificationRepository } from "../../../domain/ports/NotificationRepository";

export class MarkAsUnread {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsUnread(notificationId);
  }
}
