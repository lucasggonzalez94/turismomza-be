import { UserRepository } from "../../../domain/ports/UserRepository";
import { User } from "../../../domain/entities/User";
import { JwtService } from "../../../infrastructure/services/JwtService";

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}

export class GoogleAuthUser {
  constructor(private userRepository: UserRepository) {}

  async execute(profile: GoogleProfile) {
    const email = profile.emails[0]?.value;
    if (!email) throw new Error("Email not provided by Google");

    let user = await this.userRepository.getByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = new User(
        crypto.randomUUID(),
        profile.displayName,
        email,
        "viewer",
        true, // Google users are verified by default
        "", // No password for Google users
        profile.photos[0]?.value,
        profile.id
      );

      await this.userRepository.create(user);
    } else if (!user.googleId) {
      // Link Google account to existing user
      await this.userRepository.update(user);
    }

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
