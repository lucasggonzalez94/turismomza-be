import { UserRepository } from "../../../domain/ports/UserRepository";

export class LogoutUser {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
