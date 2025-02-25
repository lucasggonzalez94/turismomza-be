import { User } from "../../../domain/entities/User";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UserRepository } from "../../../domain/ports/UserRepository";

export class GetUserById {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<User | null> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
