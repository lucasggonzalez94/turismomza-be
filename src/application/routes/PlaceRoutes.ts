import { Router } from "express";
import multer from "multer";
import { PlaceController } from "../../infrastructure/webserver/PlaceController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { createPlaceValidator } from "../../validators/places/createPlaceValidator";

const router = Router();
const upload = multer();

router.post(
  "/",
  authenticateToken,
  upload.array("images"),
  createPlaceValidator,
  PlaceController.create
);
router.get("/", PlaceController.list);
// router.get("/:slug", PlaceController.getBySlug);
router.get("/:userId", authenticateToken, PlaceController.listByUser);

export default router;
