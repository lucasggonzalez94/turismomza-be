import { RefreshTokenRepository } from "../../../domain/ports/RefreshTokenRepository";
import { JwtService } from "../../../infrastructure/services/JwtService";

export class RefreshTokenUseCase {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) throw new Error("No refresh token provided");

    const user = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!user) throw new Error("Invalid refresh token");

    const { accessToken, refreshToken: newRefreshToken } = JwtService.generateTokens(user.userId, user.userRole);

    await this.refreshTokenRepository.save(user.userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
