import { Router } from "express";
import {
  createAttraction,
  listAttractions,
  editAttraction,
  deleteAttraction,
  listAttractionBySlug,
} from "../controllers/attractionsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", listAttractions);
router.post("/", authenticateToken, createAttraction);
router.get("/:slug", listAttractionBySlug);
router.put("/:id", authenticateToken, editAttraction);
router.delete("/:id", authenticateToken, deleteAttraction);

export default router;
