import bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { User } from "../../../domain/entities/User";
import { JwtService } from "../../../infrastructure/services/JwtService";

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) throw new Error("El email ya está en uso");

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = new User(
      crypto.randomUUID(),
      data.name,
      data.email,
      "viewer",
      false,
      hashedPassword,
    );

    user.validate();
    await this.userRepository.create(user);

    const { accessToken, refreshToken } = JwtService.generateTokens(user.id, user.role, 'credentials');
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { user, accessToken, refreshToken };
  }
}
