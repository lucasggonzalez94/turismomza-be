import jwt from "jsonwebtoken";

export class JwtService {
  static generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
  }
}
