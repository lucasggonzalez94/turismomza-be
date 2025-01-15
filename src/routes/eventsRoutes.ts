import { Router } from "express";
import {
  editAttraction,
  deleteAttraction,
} from "../controllers/attractionsController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createEvent,
  listEventBySlug,
  listEvents,
} from "../controllers/eventsController";

const router = Router();

router.get("/", listEvents);
router.post("/", authenticateToken, createEvent);
router.get("/:slug", listEventBySlug);
router.put("/:id", authenticateToken, editAttraction);
router.delete("/:id", authenticateToken, deleteAttraction);

export default router;
