import { Review } from "../../../domain/entities/Review";
import { Notification } from "../../../domain/entities/Notification";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { NotificationRepository } from "../../../domain/ports/NotificationRepository";
import { PlaceRepository } from "../../../domain/ports/PlaceRepository";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";
import { SocketService } from "../../../infrastructure/services/SocketService";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class AddReview {
  constructor(
    private reviewRepository: ReviewRepository,
    private placeRepository: PlaceRepository,
    private notificationRepository: NotificationRepository,
    private socketService: SocketService
  ) {}

  async execute(
    content: string,
    rating: number,
    userId: string,
    creationDate: Date,
    placeId: string
  ): Promise<Review> {
    const place = await this.placeRepository.getById(placeId);

    if (!place) {
      throw new NotFoundError("Place not found");
    }

    if (place.creatorId === userId) {
      throw new UnauthorizedError("You cannot review your own place");
    }

    const newReview = new Review(
      "",
      content,
      rating,
      userId,
      placeId,
      creationDate,
    );
    const review = await this.reviewRepository.addReview(newReview);

    if (place.creatorId !== userId) {
      const notification = new Notification(
        "",
        userId,
        "review",
        `New review on your place: ${review.content}`,
        false,
        new Date()
      );

      await this.notificationRepository.createNotification(notification);

      this.socketService.sendNotification(place.creatorId, {
        userId: place.creatorId,
        triggeredById: userId,
        message: `New review on your place: ${review.content}`,
        type: "review",
      })
    }

    return review;
  }
}
