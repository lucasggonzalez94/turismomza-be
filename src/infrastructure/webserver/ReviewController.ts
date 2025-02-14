import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AddReview } from "../../application/use-cases/Review/AddReview";
import { PrismaReviewRepository } from "../database/PrismaReviewRepository";
import { PrismaPlaceRepository } from "../database/PrismaPlaceRepository";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";
import { PrismaNotificationRepository } from "../database/PrismaNotificationRepository";
import { SocketService } from "../services/SocketService";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { EditReview } from "../../application/use-cases/Review/EditReview";
import { DeleteReview } from "../../application/use-cases/Review/DeleteReview";

const reviewRepository = new PrismaReviewRepository();
const placeRepository = new PrismaPlaceRepository();
const notificationRepository = new PrismaNotificationRepository();

const editReview = new EditReview(reviewRepository, placeRepository);
const deleteReview = new DeleteReview(reviewRepository);

export class ReviewController {
  static async add(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, rating, placeId } = req.body;
    const userId = req.user?.userId;

    try {
      const socketService = new SocketService(req.app.get("io"));

      const addReview = new AddReview(
        reviewRepository,
        placeRepository,
        notificationRepository,
        socketService
      );
      const review = await addReview.execute(
        content,
        rating,
        userId,
        new Date(),
        placeId
      );

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error adding review" });
    }
  }

  static async edit(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, rating, placeId } = req.body;
    const { reviewId } = req.params;
    const userId = req.user?.userId;

    try {
      const review = await editReview.execute(
        reviewId,
        content,
        rating,
        userId,
        placeId
      );

      res.status(200).json(review);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error adding review" });
    }
  }

  static async delete(req: Request, res: Response) {
    const { reviewId } = req.params;
    const userId = req.user?.userId;

    try {
      await deleteReview.execute(reviewId, userId);
      res.status(204);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error deleting review" });
    }
  }
}
