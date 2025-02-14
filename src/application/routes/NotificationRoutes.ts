import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { NotificationsController } from "../../infrastructure/webserver/NotificationController";
import { markAsReadValidator } from "../../validators/notifications/markAsReadValidator";

const router = Router();

router.get(
  "/",
  authenticateToken,
  NotificationsController.list
);
router.post(
  "/:id",
  authenticateToken,
  markAsReadValidator,
  NotificationsController.markAsRead
);

export default router;