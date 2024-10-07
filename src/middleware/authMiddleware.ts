import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.authToken;

  if (token == null)
    return res.status(401).json({ error: "No token provided" });

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: Error | null, decoded: JwtPayload | string | undefined) => {
      if (err) return res.status(403).json({ error: "Invalid token" });

      if (decoded && typeof decoded !== "string") {
        // Guardar los datos del token en `req.user` para que estén disponibles en la ruta
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
        next();
      } else {
        res.status(403).json({ error: "Invalid token" });
      }
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
