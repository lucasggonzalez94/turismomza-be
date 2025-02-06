import express from "express";
import multer from "multer";
import { UserController } from "../../infrastructure/webserver/UserController";
import { registerValidator } from "../../validators/auth/registerValidator";
import { loginValidator } from "../../validators/auth/loginValidator";
import {
  authenticateToken,
  authorizeAdmin,
} from "../../middleware/authMiddleware";
import { updateValidator } from "../../validators/auth/updateValidator";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/users", authenticateToken, authorizeAdmin, UserController.list);
router.post("/register", registerValidator, UserController.register);
router.post("/login", loginValidator, UserController.login);
router.post("/logout", authenticateToken, UserController.logout);
router.put(
  "/update",
  authenticateToken,
  upload.single("profilePicture"),
  updateValidator,
  UserController.update
);
router.post("/refresh-token", UserController.refreshToken);

export default router;
