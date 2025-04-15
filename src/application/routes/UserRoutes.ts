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
import passport from "passport";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/users", authenticateToken, authorizeAdmin, UserController.list);
router.get("/user/:userId", UserController.getById);
router.post("/register", registerValidator, UserController.register);
router.post("/login", loginValidator, UserController.login);
router.post("/logout", authenticateToken, UserController.logout);
router.get(
  "/google",
  (req, res, next) => {
    // Guardar el parámetro linking en la query para usarlo más tarde
    const linking = req.query.linking === 'true';
    // Almacenar el estado en la sesión para recuperarlo después
    req.authInfo = { linking };
    // Modificar la URL de autenticación para incluir el estado
    req.query.state = JSON.stringify({ linking });
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"]
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  UserController.googleCallback
);
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
router.get("/verify-session", authenticateToken, UserController.verify);
router.post("/link-google", authenticateToken, UserController.linkGoogle);
router.post("/unlink-google", authenticateToken, UserController.unlinkGoogle);

export default router;
