import { Router } from "express";
import { addOrRemoveFavoriteValidator } from "../../validators/favorites/addOrRemoveFavoriteValidator";
import { ContactController } from "../../infrastructure/webserver/ContactController";

const router = Router();

router.post(
  "/",
  addOrRemoveFavoriteValidator,
  ContactController.send
);

export default router;
