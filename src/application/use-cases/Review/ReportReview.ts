import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ReviewRepository } from "../../../domain/ports/ReviewRepository";

export class ReportReview {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(reviewId: string, userId: string, reason: string) {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Comment not found");
    }

    await this.reviewRepository.reportReview(reviewId, userId, reason);
  }
}
