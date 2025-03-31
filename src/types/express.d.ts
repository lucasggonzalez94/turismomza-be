import { JwtPayload } from "jsonwebtoken";

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: string;
    } & JwtPayload;
    accessToken?: string;
    refreshToken?: string;
  }
}