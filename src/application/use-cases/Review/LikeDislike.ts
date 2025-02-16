import { Notification } from "../../../domain/entities/Notification";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { NotificationRepository } from "../../../domain/ports/NotificationRepository";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";
import { SocketService } from "../../../infrastructure/services/SocketService";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class LikeDislike {
  constructor(
    private reviewRepository: ReviewRepository,
    private notificationRepository: NotificationRepository,
    private socketService: SocketService
  ) {}

  async execute(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Comment not found");
    }

    if (review.user_id !== userId) {
      throw new UnauthorizedError("You can only like your own comments");
    }

    const like = await this.reviewRepository.findLike(reviewId, userId);

    if (!like) {
      await this.reviewRepository.like(reviewId, userId);

      const notification = new Notification(
        "",
        userId,
        "like",
        "Liked your review.",
        false,
        new Date()
      );

      await this.notificationRepository.createNotification(
        review.user_id,
        notification
      );

      this.socketService.sendNotification(userId, {
        userId: review.user_id,
        triggeredById: userId,
        message: notification.message,
        type: notification.type,
      });
    } else {
      await this.reviewRepository.dislike(reviewId, userId);
    }
  }
}
