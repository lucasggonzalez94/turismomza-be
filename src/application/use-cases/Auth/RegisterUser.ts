import bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { UserE } from "../../../domain/entities/User";
import { JwtService } from "../../../infrastructure/services/JwtService";

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) throw new Error("User with this email already exists.");

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = new UserE(
      crypto.randomUUID(),
      data.name,
      data.email,
      "viewer",
      false,
      hashedPassword,
    );

    user.validate();
    await this.userRepository.create(user);

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { user, accessToken };
  }
}
