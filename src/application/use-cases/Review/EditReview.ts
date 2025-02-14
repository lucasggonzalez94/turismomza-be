import { Review } from "../../../domain/entities/Review";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { PlaceRepository } from "../../../domain/ports/PlaceRepository";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";

export class EditReview {
  constructor(
    private reviewRepository: ReviewRepository,
    private placeRepository: PlaceRepository
  ) {}

  async execute(
    reviewId: string,
    content: string,
    rating: number,
    userId: string,
    placeId: string
  ): Promise<Review> {
    const place = await this.placeRepository.getById(placeId);

    if (!place) {
      throw new NotFoundError("Place not found");
    }

    if (place.creatorId === userId) {
      throw new UnauthorizedError("You cannot review your own place");
    }

    const newReview = new Review(reviewId, content, rating, userId, placeId);
    const review = await this.reviewRepository.editReview(newReview);

    return review;
  }
}
