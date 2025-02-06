import express from "express";
import { UserController } from "../../infrastructure/webserver/UserController";
import { registerValidator } from '../../validators/auth/registerValidator';
import { loginValidator } from '../../validators/auth/loginValidator';

const router = express.Router();
router.post("/register", registerValidator, UserController.register);
router.post("/login", loginValidator, UserController.login);
router.post("/refresh-token", UserController.refreshToken);

export default router;
