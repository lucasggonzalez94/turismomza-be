import { Router } from "express";
import { ReviewController } from "../../infrastructure/webserver/ReviewController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { addReviewValidator } from "../../validators/reviews/addReviewValidator";

const router = Router();

router.post(
  "/",
  authenticateToken,
  addReviewValidator,
  ReviewController.addReview
);

export default router;
