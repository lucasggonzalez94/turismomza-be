import { Router } from "express";
import {
  register,
  login,
  verifyTwoFactorCode,
  disableTwoFactorAuth,
  enableTwoFactorAuth,
  listUsers,
  updateUser,
} from "../controllers/authController";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";

const router = Router();

router.get("/users", authenticateToken, authorizeAdmin, listUsers);
router.post("/register", register);
router.post("/update-user", authenticateToken, updateUser);
router.post("/login", login);
router.post("/verify-2fa", verifyTwoFactorCode);
router.post("/enable-2fa", authenticateToken, enableTwoFactorAuth);
router.post("/disable-2fa", authenticateToken, disableTwoFactorAuth);

export default router;
