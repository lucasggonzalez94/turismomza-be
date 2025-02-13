import { Router } from "express";
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
router.get("/", authenticateToken, FavoriteController.listByUser);

export default router;
