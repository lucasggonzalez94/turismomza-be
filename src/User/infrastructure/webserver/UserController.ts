import { Request, Response } from "express";
import { RegisterUser } from "../../domain/use-cases/RegisterUser";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { LoginUser } from "../../domain/use-cases/LoginUser";
import { PrismaRefreshTokenRepository } from "../../../RefreshToken/infrastructure/database/PrismaRefreshTokenRepository";
import { GenerateRefreshToken } from "../../../RefreshToken/domain/use-cases/GenerateRefreshToken";
import { EmailService } from "../services/EmailService";

const userRepository = new PrismaUserRepository();
const emailService = new EmailService();

const registerUser = new RegisterUser(userRepository, emailService);
const loginUser = new LoginUser(userRepository);

const refreshTokenRepository = new PrismaRefreshTokenRepository();

const generateRefreshToken = new GenerateRefreshToken(refreshTokenRepository);

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { user, accessToken } = await registerUser.execute(req.body);

      res.cookie("authToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      res.status(201).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await loginUser.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
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
