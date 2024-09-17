// src/routes/atraccionesRoutes.ts

import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { createAdvertisement, updateAdvertisement } from "../controllers/advertisementsController";

const router = Router();

router.post("/", authenticateToken, createAdvertisement);
router.put("/:id", authenticateToken, updateAdvertisement);
router.get("/", authenticateToken, createAdvertisement);
router.delete("/:id", authenticateToken, createAdvertisement);

export default router;
