import { Review } from "../entities/Review";

export interface ReviewRepository {
  addReview(review: Review): Promise<Review>;
}