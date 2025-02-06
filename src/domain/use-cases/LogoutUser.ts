import { RefreshTokenRepository } from "../ports/RefreshTokenRepository";

export class LogoutUser {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }
}
