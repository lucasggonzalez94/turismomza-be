import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { NotificationsController } from "../../infrastructure/webserver/NotificationController";

const router = Router();

router.get(
  "/",
  authenticateToken,
  NotificationsController.list
);

export default router;