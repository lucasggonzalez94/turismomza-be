import bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/UserRepository";

export class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, password: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) throw new Error("User not found");

    if (!password) {
      throw new Error("Password is required");
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordMatch) {
      throw new Error("Password is incorrect");
    }

    await this.userRepository.delete(user);
  }
}
