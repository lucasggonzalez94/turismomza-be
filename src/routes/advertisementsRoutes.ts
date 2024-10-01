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
router.get("/", authenticateToken, authorizeAdmin, listAdvertisements);
router.get("/:userId", authenticateToken, listAdvertisementsByUser);
router.delete("/:id", authenticateToken, deleteAdvertisement);
router.put("/impression/:adId", incrementImpressions);
router.put("/click/:adId", incrementClicks);

export default router;
