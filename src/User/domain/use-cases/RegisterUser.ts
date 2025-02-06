import { EmailService } from "../../infrastructure/services/EmailService";
import { JwtService } from "../../infrastructure/services/JwtService";
import { User } from "../entities/User";
import { UserRepository } from "../ports/UserRepository";
import bcrypt from "bcryptjs";

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) throw new Error("User with this email already exists.");

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = new User(
      crypto.randomUUID(),
      data.name,
      data.email,
      hashedPassword,
      "viewer",
      false
    );

    user.validate();
    await this.userRepository.create(user);

    const token = JwtService.generateAccessToken(user.id, user.role);
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { user, token };
  }
}
