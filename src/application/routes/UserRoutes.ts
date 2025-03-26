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
import { deleteValidator } from "../../validators/auth/deleteValidator";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/google', UserController.googleAuth);
router.post('/google/callback', UserController.googleCallback);
router.get("/users", authenticateToken, authorizeAdmin, UserController.list);
router.get("/user/:userId", UserController.getById);
router.get("/user/google/:googleId", UserController.getByGoogleId);
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
router.delete(
  "/delete",
  authenticateToken,
  deleteValidator,
  UserController.delete
);
router.post("/refresh-token", UserController.refresh);
router.get("/verify-session",authenticateToken, UserController.verify);

export default router;
