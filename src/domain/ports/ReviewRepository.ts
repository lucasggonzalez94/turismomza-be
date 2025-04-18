import { Review } from "../entities/Review";

export interface ReviewRepository {
  addReview(review: Review): Promise<Review>;
  editReview(review: Review): Promise<Review>;
  findById(reviewId: string): Promise<{ id: string; userId: string } | null>;
  deleteReview(reviewId: string): Promise<void>;
  reportReview(reviewId: string, userId: string, reason: string): Promise<void>;
  findLike(reviewId: string, userId: string): Promise<boolean>;
  like(reviewId: string, userId: string): Promise<void>;
  dislike(reviewId: string, userId: string): Promise<void>;
}
