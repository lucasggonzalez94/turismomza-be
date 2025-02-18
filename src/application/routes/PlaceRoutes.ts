import { Router } from "express";
import multer from "multer";
import { PlaceController } from "../../infrastructure/webserver/PlaceController";
import { authenticateToken, getUser } from "../../middleware/authMiddleware";
import { createPlaceValidator } from "../../validators/places/createPlaceValidator";
import { editPlaceValidator } from "../../validators/places/editPlaceValidator";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer( { storage: storage } );

router.post(
  "/",
  authenticateToken,
  upload.array("images"),
  createPlaceValidator,
  PlaceController.create
);
router.put(
  "/:id",
  authenticateToken,
  upload.array("images"),
  editPlaceValidator,
  PlaceController.edit
);
router.delete("/:id", authenticateToken, PlaceController.delete);
router.get("/", getUser, PlaceController.list);
router.get("/:slug", PlaceController.getBySlug);
router.get("/user/:userId", authenticateToken, PlaceController.listByUser);

export default router;
