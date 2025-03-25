import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { EmailService } from "../services/EmailService";
import { DeleteUser } from "../../application/use-cases/Auth/DeleteUser";
import { ListUsers } from "../../application/use-cases/Auth/ListUsers";
import { LoginUser } from "../../application/use-cases/Auth/LoginUser";
import { LogoutUser } from "../../application/use-cases/Auth/LogoutUser";
import { RegisterUser } from "../../application/use-cases/Auth/RegisterUser";
import { UpdateUser } from "../../application/use-cases/Auth/UpdateUser";
import { GetUserById } from "../../application/use-cases/Auth/GetUserById";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { GetUserByEmail } from "../../application/use-cases/Auth/GetUserByEmail";
import { JwtService } from "../services/JwtService";
import { GoogleAuthUser } from "../../application/use-cases/Auth/GoogleAuthUser";
import passport from "passport";
import { GetUserByGoogleId } from "../../application/use-cases/Auth/GetUserByGoogleId";

const userRepository = new PrismaUserRepository();
const emailService = new EmailService();

const googleAuthUser = new GoogleAuthUser(userRepository);
const registerUser = new RegisterUser(userRepository, emailService);
const loginUser = new LoginUser(userRepository);
const logoutUser = new LogoutUser(userRepository);
const updateUser = new UpdateUser(userRepository, emailService);
const deleteUser = new DeleteUser(userRepository);
const listUsers = new ListUsers(userRepository);
const getUserById = new GetUserById(userRepository);
const getUserByGoogleId = new GetUserByGoogleId(userRepository);
const getUserByEmail = new GetUserByEmail(userRepository);

export class UserController {
  static googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
  });

  static async googleCallback(req: Request, res: Response) {
    try {
      const { name, email, image, googleId } = req.body;

      if (!email || !googleId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { user, accessToken, refreshToken } = await googleAuthUser.execute({
        id: googleId,
        displayName: name,
        emails: [{ value: email }],
        photos: image ? [{ value: image }] : []
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ user, accessToken });
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, accessToken, refreshToken } = await registerUser.execute(
        req.body
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000, // 7 días
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      const { password, ...restUser } = user;

      res.status(201).json({ accessToken, restUser });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(401).json({ error: errorMessage });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await loginUser.execute(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.json({ accessToken, user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await logoutUser.execute(req.user!.userId);

      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Error logging out" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const user = await updateUser.execute({
        userId: req.user!.userId,
        currentPassword: req.body.currentPassword,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        bio: req.body.bio,
        location: req.body.location,
        website: req.body.website,
        language: req.body.language,
        verified: req.body.verified,
        file: req.file ? req.file.buffer : undefined,
      });

      res.status(200).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await deleteUser.execute(req.user!.userId, req.body.password);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async getById(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const result = await getUserById.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error getting user" });
    }
  }

  static async getByGoogleId(req: Request, res: Response) {
    const { googleId } = req.params;

    try {
      const result = await getUserByGoogleId.execute(googleId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error getting user" });
    }
  }

  static async getByEmail(req: Request, res: Response) {
    const { email } = req.params;

    try {
      const result = await getUserByEmail.execute(email);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error getting user" });
    }
  }

  static async list(req: Request, res: Response) {
    const { page = 1, pageSize = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);

    try {
      const result = await listUsers.execute(pageNumber, pageSizeNumber);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error listing users" });
    }
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No autorizado" });

    try {
      const decoded = JwtService.verifyRefreshToken(refreshToken);
      const accessToken = JwtService.generateAccessToken(
        (decoded as any).userId,
        (decoded as any).userRole
      );
      res.json({ accessToken });
    } catch {
      return res.status(401).json({ error: "Token inválido" });
    }
  }
}
