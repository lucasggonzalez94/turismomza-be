import { Router } from "express";
import { ReviewController } from "../../infrastructure/webserver/ReviewController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { addReviewValidator } from "../../validators/reviews/addReviewValidator";
import { editReviewValidator } from "../../validators/reviews/editReviewValidator";

const router = Router();

router.post(
  "/",
  authenticateToken,
  addReviewValidator,
  ReviewController.add
);
router.put(
  "/:reviewId",
  authenticateToken,
  editReviewValidator,
  ReviewController.edit
);
router.delete(
  "/:reviewId",
  authenticateToken,
  ReviewController.delete
);
router.post(
  "/:reviewId",
  authenticateToken,
  ReviewController.report
);
router.post(
  "/like/:reviewId",
  authenticateToken,
  ReviewController.likeDislike
);

export default router;
