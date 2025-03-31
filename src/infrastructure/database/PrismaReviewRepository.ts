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
        userId: review.userId,
        placeId: review.placeId,
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
      createdReview.userId,
      createdReview.placeId,
      createdReview.creationDate
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
      editedReview.userId,
      editedReview.placeId,
      editedReview.creationDate
    );
  }

  async findById(reviewId: string) {
    return prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
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
        reviewId: reviewId,
        userId: userId,
        reason,
      },
    });
  }

  async findLike(reviewId: string, userId: string): Promise<boolean> {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    return !!existingLike;
  }

  async like(reviewId: string, userId: string): Promise<void> {
    await prisma.like.create({
      data: {
        userId: userId,
        reviewId: reviewId,
        like: true,
      },
    });
  }

  async dislike(reviewId: string, userId: string): Promise<void> {
    await prisma.like.delete({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });
  }
}
