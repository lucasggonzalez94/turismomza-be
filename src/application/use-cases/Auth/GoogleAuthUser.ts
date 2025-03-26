import { UserRepository } from "../../../domain/ports/UserRepository";
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
      user = await this.userRepository.createWithGoogle(
        profile.displayName,
        email,
        profile.photos[0]?.value || "",
        profile.id
      );
    } else if (!user.googleId) {
      user.googleId = profile.id;
      user.googleImage = profile.photos[0]?.value || "";
      await this.userRepository.update(user);
    }

    const { accessToken, refreshToken } = JwtService.generateTokens(user.id, user.role, "google");

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
