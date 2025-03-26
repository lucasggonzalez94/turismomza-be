import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export class JwtService {
  static generateAccessToken(userId: string, userRole: string, authProvider: string) {
    return jwt.sign({ userId, userRole, authProvider }, ACCESS_SECRET, { expiresIn: "15m" });
  }

  static generateRefreshToken(userId: string, userRole: string, authProvider: string) {
    return jwt.sign({ userId, userRole, authProvider }, REFRESH_SECRET, { expiresIn: "7d" });
  }

  static generateTokens = (userId: string, userRole: string, authProvider: string) => {
    const accessToken = jwt.sign({ userId, userRole, authProvider }, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId, userRole, authProvider }, REFRESH_SECRET, { expiresIn: "7d" });
  
    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_SECRET);
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_SECRET);
  }
}