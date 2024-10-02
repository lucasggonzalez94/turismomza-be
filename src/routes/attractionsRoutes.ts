import { Router } from "express";
import {
  createAttraction,
  listAttractions,
  editAttraction,
  deleteAttraction,
  listAttraction,
  listAttractionsByUser,
} from "../controllers/attractionsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createAttraction);
router.get("/", listAttractions);
router.get("/:id", listAttraction);
router.get("/by-user", authenticateToken, listAttractionsByUser);
router.put("/:id", authenticateToken, editAttraction);
router.delete("/:id", authenticateToken, deleteAttraction);

export default router;
