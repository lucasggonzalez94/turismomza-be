import express from "express";
import { UserController } from "../../infrastructure/webserver/UserController";

const router = express.Router();
router.post("/register", UserController.register);
router.post("/login", UserController.login);

export default router;
