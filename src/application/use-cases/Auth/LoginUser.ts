import bcrypt from "bcryptjs";
import { RefreshTokenRepository } from "../../../domain/ports/RefreshTokenRepository";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { JwtService } from "../../../infrastructure/services/JwtService";

export class LoginUser {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private emailService: EmailService
  ) {}

  async execute(data: { email: string; password: string }) {
    const user = await this.userRepository.getByEmail(data.email);
    if (!user) throw new Error("User not found.");

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error("Incorrect password.");

    // TODO: Implementar 2FA
    if (user.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.enableTwoFactorAuth(code);
      await this.userRepository.update(user);
      await this.emailService.send2FACode(user.email, user.twoFactorCode);
      return { user, message: "Código de 2FA enviado." };
    }

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await this.refreshTokenRepository.save(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
