import { Router } from "express";
import multer from "multer";
import { PlaceController } from "../../infrastructure/webserver/PlaceController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { createPlaceValidator } from "../../validators/attractions/createPlaceValidator";

const router = Router();
const upload = multer();

router.post(
  "/",
  authenticateToken,
  upload.array("images"),
  createPlaceValidator,
  PlaceController.create
);

export default router;
