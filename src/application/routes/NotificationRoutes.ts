import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { NotificationsController } from "../../infrastructure/webserver/NotificationController";

const router = Router();

router.get(
  "/",
  authenticateToken,
  NotificationsController.list
);
router.post(
  "/read/:id",
  authenticateToken,
  NotificationsController.markAsRead
);
router.post(
  "/unread/:id",
  authenticateToken,
  NotificationsController.markAsUnread
);

export default router;