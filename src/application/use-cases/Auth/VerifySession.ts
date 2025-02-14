import { UserRepository } from "../../../domain/ports/UserRepository";

export class VerifySession {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) throw new Error("Invalid credentials");
    const { password, ...restUser } = user;
    return restUser;
  }
}
