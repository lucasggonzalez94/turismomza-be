import { UserRepository } from "../ports/UserRepository";
import bcrypt from "bcryptjs";
import { JwtService } from "../../infrastructure/services/JwtService";
import { RefreshTokenRepository } from "../ports/RefreshTokenRepository";

export class LoginUser {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(data: { email: string; password: string }) {
    const user = await this.userRepository.getByEmail(data.email);
    if (!user) throw new Error("User not found.");

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error("Incorrect password.");

    // TODO: Implementar 2FA
    // if (user.twoFactorEnabled) {
    //   const code = Math.floor(100000 + Math.random() * 900000).toString();
    //   user.enableTwoFactorAuth(code);
    //   await this.userRepository.update(user);
    //   return { message: "Código de 2FA enviado." };
    // }

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await this.refreshTokenRepository.save(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
