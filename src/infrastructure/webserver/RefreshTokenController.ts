import { Request, Response } from "express";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { PrismaRefreshTokenRepository } from "../database/PrismaRefreshTokenRepository";
import { RefreshTokenUseCase } from "../../application/use-cases/Auth/RefreshTokenUseCase";

const userRepository = new PrismaUserRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();
const refreshTokenUseCase = new RefreshTokenUseCase(
  refreshTokenRepository,
  userRepository
);

export class RefreshTokenController {
  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
      }

      const { newAccessToken, newRefreshToken } =
        await refreshTokenUseCase.execute(refreshToken);

      res.cookie("authToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000, // 7 días
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.status(200).json({ message: 'Token refreshed.' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(403).json({ error: errorMessage });
    }
  }
}
