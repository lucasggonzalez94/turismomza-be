import { Review } from "../../../domain/entities/Review";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";

export class EditReview {
  constructor(
    private reviewRepository: ReviewRepository
  ) {}

  async execute(
    reviewId: string,
    content: string,
    rating: number,
    userId: string,
    placeId: string
  ): Promise<Review> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Comment not found");
    }

    if (review.userId !== userId) {
      throw new UnauthorizedError("You can only edit your own comments");
    }

    const newReview = new Review(reviewId, content, rating, userId, placeId);
    const editedReview = await this.reviewRepository.editReview(newReview);

    return editedReview;
  }
}
