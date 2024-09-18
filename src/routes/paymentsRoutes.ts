import { Router } from "express";
import {
  capturePaymentPaypal,
  createPaymentMercadoPago,
  createPaymentPaypal,
  handleMercadoPagoWebhook,
} from "../controllers/paymentsController";

const router = Router();

router.post("/create-payment-paypal", createPaymentPaypal);
router.post("/capture-payment-paypal", capturePaymentPaypal);
router.post("/create-payment-mercadopago", createPaymentMercadoPago);
router.post("/capture-payment-mercadopago", handleMercadoPagoWebhook);

export default router;
