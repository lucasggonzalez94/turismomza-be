import { UserRepository } from "../../../domain/ports/UserRepository";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { RefreshTokenRepository } from '../../../domain/ports/RefreshTokenRepository';

export class LoginWithGoogle {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private emailService: EmailService
  ) {}

  async execute(name: string, email: string, image: string, googleId: string) {
    const user = await this.userRepository.getByGoogleId(googleId);

    if (!user) {
      const newUser = await this.userRepository.createWithGoogle(
        name,
        email,
        image,
        googleId
      );

      const { accessToken, refreshToken } = JwtService.generateTokens(
        newUser.id,
        newUser.role
      );

      await this.refreshTokenRepository.save(newUser.id, refreshToken);
      await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);

      return { user: newUser, accessToken, refreshToken };
    }

    const { accessToken, refreshToken } = JwtService.generateTokens(
      user.id,
      user.role
    );
    await this.refreshTokenRepository.save(user.id, refreshToken);
    return { user, accessToken, refreshToken };
  }
}
