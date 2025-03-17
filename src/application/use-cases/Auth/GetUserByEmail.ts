import { User } from "../../../domain/entities/User";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UserRepository } from "../../../domain/ports/UserRepository";

export class GetUserByEmail {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string): Promise<User | null> {
    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
