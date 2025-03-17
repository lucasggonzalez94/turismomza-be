import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtService } from "../infrastructure/services/JwtService";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = JwtService.verifyAccessToken(token);
    req.user = {
      userId: (decoded as any).userId,
      role: (decoded as any).role || "viewer",
      ...(decoded as JwtPayload),
    };
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
    (err: Error | null, decoded: JwtPayload | string | undefined) => {
      if (err) return next();

      if (decoded && typeof decoded !== "string") {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
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
