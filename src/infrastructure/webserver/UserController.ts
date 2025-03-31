import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { EmailService } from "../services/EmailService";
import { DeleteUser } from "../../application/use-cases/Auth/DeleteUser";
import { ListUsers } from "../../application/use-cases/Auth/ListUsers";
import { LoginUser } from "../../application/use-cases/Auth/LoginUser";
import { RegisterUser } from "../../application/use-cases/Auth/RegisterUser";
import { UpdateUser } from "../../application/use-cases/Auth/UpdateUser";
import { GetUserById } from "../../application/use-cases/Auth/GetUserById";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { VerifySession } from "../../application/use-cases/Auth/VerifySession";
import { RefreshTokenUseCase } from "../../application/use-cases/Auth/RefreshTokenUseCase";
import { PrismaRefreshTokenRepository } from "../database/PrismaRefreshTokenRepository";

const userRepository = new PrismaUserRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();
const emailService = new EmailService();

const registerUser = new RegisterUser(userRepository, emailService);
const loginUser = new LoginUser(userRepository, refreshTokenRepository, emailService);
const updateUser = new UpdateUser(userRepository, emailService);
const deleteUser = new DeleteUser(userRepository);
const listUsers = new ListUsers(userRepository);
const getUserById = new GetUserById(userRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository);
const verifySession = new VerifySession(userRepository);

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, accessToken, refreshToken } = await registerUser.execute(req.body);

      res.cookie("authToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000,
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

  static async googleCallback(req: Request, res: Response) {
    try {
      if (!req.accessToken || !req.user) {
        console.error(
          "Error: accessToken o user no están disponibles en la solicitud"
        );
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=auth_failed`
        );
      }

      res.cookie("authToken", req.accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
        sameSite: "none",
        domain: process.env.COOKIE_DOMAIN,
      });
      
      // Guardar el refreshToken en las cookies
      if (req.refreshToken) {
        res.cookie("refreshToken", req.refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 604800000, // 7 días
          sameSite: "none",
          domain: process.env.COOKIE_DOMAIN,
        });
      }

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
    } catch (error) {
      console.error("Error en Google callback:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
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
        secure: true,
        maxAge: 3600000,
        sameSite: "none",
        domain: process.env.COOKIE_DOMAIN,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 604800000,
        sameSite: "none",
        domain: process.env.COOKIE_DOMAIN,
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
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
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
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await refreshTokenUseCase.execute(refreshToken);

      res.cookie("authToken", accessToken, {
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

      res.status(200).json({ message: "Token refreshed." });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(403).json({ error: errorMessage });
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await verifySession.execute(userId);
      res.status(200).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(401).json({ error: errorMessage });
    }
  }
}
