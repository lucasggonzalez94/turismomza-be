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
      },
    });

    return new Review(
      createdReview.id,
      createdReview.content,
      createdReview.rating,
      createdReview.user_id,
      createdReview.place_id,
      createdReview.creation_date
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
      },
    });

    return new Review(
      editedReview.id,
      editedReview.content,
      editedReview.rating,
      editedReview.user_id,
      editedReview.place_id,
      editedReview.creation_date
    );
  }

  async findById(reviewId: string) {
    return prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, user_id: true },
    });
  }

  async deleteReview(reviewId: string) {
    await prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async reportReview(
    reviewId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    await prisma.report.create({
      data: {
        review_id: reviewId,
        user_id: userId,
        reason,
      },
    });
  }
}
