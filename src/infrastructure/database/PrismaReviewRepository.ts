import { PrismaClient } from "@prisma/client";
import { Review } from "../../domain/entities/Review";
import { ReviewRepository } from "../../domain/ports/ReviewRepository";

const prisma = new PrismaClient();

export class PrismaReviewRepository implements ReviewRepository {
  async addReview(review: Review): Promise<Review> {
    const createdReview = await prisma.review.create({
      data: {
        content: review.content,
        rating: review.rating,
        user_id: review.userId,
        place_id: review.placeId,
      },
      include: {
        user: true,
        likes: true,
      }
    });

    return new Review(
      createdReview.id,
      createdReview.content,
      createdReview.rating,
      createdReview.user_id,
      createdReview.place_id,
      createdReview.creation_date,
    );
  }

  async editReview(review: Review): Promise<Review> {
    const editedReview = await prisma.review.update({
      where: {
        id: review.id,
      },
      data: {
        content: review.content,
        rating: review.rating,
      },
      include: {
        user: true,
        likes: true,
      }
    });

    return new Review(
      editedReview.id,
      editedReview.content,
      editedReview.rating,
      editedReview.user_id,
      editedReview.place_id,
      editedReview.creation_date,
    );
  }
}
