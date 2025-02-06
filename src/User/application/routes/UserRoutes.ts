import express from "express";
import { UserController } from "../../infrastructure/webserver/UserController";

const router = express.Router();
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/refresh-token", UserController.refreshToken);

export default router;
