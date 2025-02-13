import { Router } from "express";
import { PlaceController } from "../../infrastructure/webserver/PlaceController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { addOrRemoveFavoriteValidator } from "../../validators/favorites/addOrRemoveFavoriteValidator";
import { FavoriteController } from "../../infrastructure/webserver/FavoriteController";

const router = Router();

router.post(
  "/",
  authenticateToken,
  addOrRemoveFavoriteValidator,
  FavoriteController.addOrRemove
);
router.get("/:slug", PlaceController.getBySlug);

export default router;
