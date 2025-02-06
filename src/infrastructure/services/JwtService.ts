import jwt from "jsonwebtoken";
import { RefreshToken } from "../../domain/entities/RefreshToken";

export class JwtService {
  static generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
  }

  static generateRefreshToken(userId: string): RefreshToken {
    return new RefreshToken(
      crypto.randomUUID(),
      crypto.randomUUID(),
      userId,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expira en 30 días
    );
  }
}
