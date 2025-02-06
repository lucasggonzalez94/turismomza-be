import { Request, Response } from "express";
import { RegisterUser } from "../../domain/use-cases/RegisterUser";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { LoginUser } from "../../domain/use-cases/LoginUser";
import { EmailService } from "../services/EmailService";
import { PrismaRefreshTokenRepository } from "../database/PrismaRefreshTokenRepository";
import { GenerateRefreshToken } from "../../domain/use-cases/GenerateRefreshToken";
import { validationResult } from "express-validator";

const userRepository = new PrismaUserRepository();
const emailService = new EmailService();
const refreshTokenRepository = new PrismaRefreshTokenRepository();

const registerUser = new RegisterUser(userRepository, emailService);
const loginUser = new LoginUser(userRepository, refreshTokenRepository, emailService);

const generateRefreshToken = new GenerateRefreshToken(refreshTokenRepository);

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

  static async refreshToken(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.body;
      const result = await generateRefreshToken.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }
}
