import { UserRepository } from "../ports/UserRepository";
import { CloudinaryService } from "../../infrastructure/services/CloudinaryService";
import bcrypt from "bcryptjs";
import { ProfilePicture } from "../value-objects/ProfilePicture";
import { EmailService } from "../../infrastructure/services/EmailService";

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
    file?: Buffer;
  }) {
    const user = await this.userRepository.getById(data.userId);
    if (!user) throw new Error("User not found");

    if (
      data.currentPassword &&
      !(await bcrypt.compare(data.currentPassword, user.password))
    ) {
      throw new Error("Current password is incorrect");
    }

    if (data.file) {
      if (user.profilePicture) {
        await CloudinaryService.deleteImage(user.profilePicture.public_id);
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
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 12);
      await this.emailService.sendPasswordUpdateEmail(user.email, user.name);
    }

    await this.userRepository.update(user);
  }
}
