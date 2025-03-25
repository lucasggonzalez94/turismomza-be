import { User } from "../../../domain/entities/User";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UserRepository } from "../../../domain/ports/UserRepository";

export class GetUserByGoogleId {
  constructor(private userRepository: UserRepository) {}

  async execute(googleId: string): Promise<User | null> {
    const user = await this.userRepository.getByGoogleId(googleId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
