import { Router } from "express";
import multer from "multer";
import { PlaceController } from "../../infrastructure/webserver/PlaceController";
import { authenticateToken } from "../../middleware/authMiddleware";
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
router.get("/", PlaceController.list);
router.get("/favorites", authenticateToken, PlaceController.listFavorites);
router.get("/user", authenticateToken, PlaceController.listByUser);
router.get("/slug/:slug", PlaceController.getBySlug);
router.delete("/:id", authenticateToken, PlaceController.delete);

export default router;
