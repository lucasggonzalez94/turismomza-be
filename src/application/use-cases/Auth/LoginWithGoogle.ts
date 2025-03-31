import { UserRepository } from "../../../domain/ports/UserRepository";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { JwtService } from "../../../infrastructure/services/JwtService";

export class LoginWithGoogle {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(name: string, email: string, image: string, googleId: string) {
    const user = await this.userRepository.createWithGoogle(name, email, image, googleId);

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { user, accessToken };
  }
}