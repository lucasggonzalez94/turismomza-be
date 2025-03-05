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
import { RefreshTokenController } from "../../infrastructure/webserver/RefreshTokenController";
import { VerifyTokenController } from "../../infrastructure/webserver/VerifySessionController";
import passport from "passport";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/users", authenticateToken, authorizeAdmin, UserController.list);
router.get("/user/:userId", UserController.getById);
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
router.post("/refresh-token", RefreshTokenController.refresh);
router.get("/verify-session", authenticateToken, VerifyTokenController.handle);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);

export default router;
