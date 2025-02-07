import jwt from "jsonwebtoken";
import { RefreshTokenRepository } from "../ports/RefreshTokenRepository";
import { UserRepository } from "../ports/UserRepository";
import { JwtService } from "../../infrastructure/services/JwtService";
import { RefreshToken } from "../entities/RefreshToken";

export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private userRepository: UserRepository
  ) {}

  async execute(refreshToken: RefreshToken) {
    if (!refreshToken) throw new Error("No refresh token provided");

    const tokenEntry = await this.refreshTokenRepository.findByToken(
      refreshToken
    );
    if (!tokenEntry) throw new Error("Invalid refresh token");

    const user = await this.userRepository.getById(tokenEntry.userId);
    if (!user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );

    const newRefreshToken = JwtService.generateRefreshToken(user.id);

    await this.refreshTokenRepository.save(user.id, newRefreshToken);

    return { newAccessToken, newRefreshToken };
  }
}
