import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtService } from "../infrastructure/services/JwtService";
import { AuthenticatedUser } from "../types/auth.types";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = JwtService.verifyAccessToken(token) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;

  if (!token) return next();

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: Error | null, decoded: any) => {
      if (err) return next();

      if (decoded) {
        req.user = decoded as AuthenticatedUser;
      }
      return next();
    }
  );
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};
