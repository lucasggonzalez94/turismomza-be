// src/routes/atraccionesRoutes.ts

import { Router } from "express";
import {
  capturePayment,
  createPayment,
} from "../controllers/paymentsController";

const router = Router();

router.post("/create-payment", createPayment);
router.post("/capture-payment", capturePayment);

export default router;
