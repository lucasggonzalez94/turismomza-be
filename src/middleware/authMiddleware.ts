import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticatedUser } from "../types/auth.types";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: Error | null, decoded: JwtPayload | string | undefined) => {
      console.log(err);
      console.log(decoded);
      if (err) return res.status(403).json({ error: "Invalid token" });

      if (decoded && typeof decoded !== "string") {
        req.user = {
          userId: decoded.userId,
          role: decoded.userRole,
          authProvider: decoded.authProvider
        };
        next();
      } else {
        res.status(403).json({ error: "Invalid token" });
      }
    }
  );
};

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

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
