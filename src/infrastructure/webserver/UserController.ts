import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { EmailService } from "../services/EmailService";
import { PrismaRefreshTokenRepository } from "../database/PrismaRefreshTokenRepository";
import { DeleteUser } from "../../application/use-cases/Auth/DeleteUser";
import { ListUsers } from "../../application/use-cases/Auth/ListUsers";
import { LoginUser } from "../../application/use-cases/Auth/LoginUser";
import { LogoutUser } from "../../application/use-cases/Auth/LogoutUser";
import { RegisterUser } from "../../application/use-cases/Auth/RegisterUser";
import { UpdateUser } from "../../application/use-cases/Auth/UpdateUser";

const userRepository = new PrismaUserRepository();
const emailService = new EmailService();
const refreshTokenRepository = new PrismaRefreshTokenRepository();

const registerUser = new RegisterUser(userRepository, emailService);
const loginUser = new LoginUser(
  userRepository,
  refreshTokenRepository,
  emailService
);
const logoutUser = new LogoutUser(refreshTokenRepository);
const updateUser = new UpdateUser(userRepository, emailService);
const deleteUser = new DeleteUser(userRepository);
const listUsers = new ListUsers(userRepository);

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, accessToken } = await registerUser.execute(req.body);

      res.cookie("authToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      const { password, ...restUser } = user;

      res.status(201).json(restUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, accessToken, refreshToken } = await loginUser.execute(
        req.body
      );

      res.cookie("authToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000, // 7 días
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      const { password, ...restUser } = user;

      res.status(200).json(restUser);
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
}
