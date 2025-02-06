import { RefreshToken } from "../entities/RefreshToken";
import { RefreshTokenRepository } from "../ports/RefreshTokenRepository";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class GenerateRefreshToken {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(userId: string) {
    const token = crypto.randomBytes(40).toString("hex");
    const refreshToken = new RefreshToken(
      crypto.randomUUID(),
      token,
      userId,
      new Date(Date.now() + 10 * 60 * 1000),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    await this.refreshTokenRepository.save(refreshToken);
    return { refreshToken: refreshToken.token };
  }
}
