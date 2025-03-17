import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";

export class DeleteReview {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Comment not found");
    }

    if (review.userId !== userId) {
      throw new UnauthorizedError("You can only delete your own comments");
    }

    await this.reviewRepository.deleteReview(reviewId);
  }
}
