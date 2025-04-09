import bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { ProfilePicture } from "../../../domain/value-objects/ProfilePicture";
import { CloudinaryService } from "../../../infrastructure/services/CloudinaryService";
import { EmailService } from "../../../infrastructure/services/EmailService";
import { User } from "../../../domain/entities/User";

export class UpdateUser {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(data: {
    userId: string;
    currentPassword: string;
    name?: string;
    email?: string;
    password?: string;
    bio?: string;
    location?: string;
    website?: string;
    language?: string[];
    verified?: boolean;
    file?: Buffer;
  }): Promise<User | null> {
    const user = await this.userRepository.getById(data.userId);
    if (!user) throw new Error("User not found");

    if (
      (user?.hasPassword && !data?.currentPassword) ||
      !(await bcrypt.compare(data?.currentPassword, user?.password || ""))
    ) {
      throw new Error("Current password is incorrect");
    }

    if (data.file) {
      if (user.profilePicture) {
        await CloudinaryService.destroyImage(user.profilePicture.publicId);
      }

      const uploadResult = await CloudinaryService.uploadImage(data.file);
      if (!uploadResult) throw new Error("Error uploading to Cloudinary");

      user.profilePicture = new ProfilePicture(
        crypto.randomUUID(),
        uploadResult.publicId,
        uploadResult.url
      );
    }

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.bio) user.bio = data.bio;
    if (data.location) user.location = data.location;
    if (data.website) user.website = data.website;
    if (data.language) user.language = data.language;
    if (data.verified) user.verified = data.verified;
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 12);
      await this.emailService.sendPasswordUpdateEmail(user.email, user.name);
    }

    const updatedUser = await this.userRepository.update(user);

    return updatedUser;
  }
}
