import { Review } from "../entities/Review";

export interface ReviewRepository {
  addReview(review: Review): Promise<Review>;
  editReview(review: Review): Promise<Review>;
  findById(reviewId: string): Promise<{ id: string; user_id: string } | null>;
  deleteReview(reviewId: string): Promise<void>;
  reportReview(reviewId: string, userId: string, reason: string): Promise<void>;
}
