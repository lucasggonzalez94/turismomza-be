import { Router } from "express";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";
import {
  createAdvertisement,
  deleteAdvertisement,
  incrementClicks,
  incrementImpressions,
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
router.put('/impression/:id', incrementImpressions);
router.put('/click/:id', incrementClicks);

export default router;
