import { Router } from "express";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";
import {
  createAdvertisement,
  deleteAdvertisement,
  listAdvertisements,
  listAdvertisementsByUser,
  updateAdvertisement,
} from "../controllers/advertisementsController";

const router = Router();

router.post("/", authenticateToken, createAdvertisement);
router.put("/:id", authenticateToken, updateAdvertisement);
router.get("/", authorizeAdmin, listAdvertisements);
router.get("/:userId", authenticateToken, listAdvertisementsByUser);
router.delete("/:id", authenticateToken, deleteAdvertisement);

export default router;
