import { UserRepository } from "../../domain/ports/UserRepository";

export class ListUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(page: number, pageSize: number) {
    const totalUsers = await this.userRepository.getAll(page, pageSize);
    const users = await this.userRepository.getAll(page, pageSize);

    return {
      total: totalUsers.length,
      page,
      pageSize,
      totalPages: Math.ceil(totalUsers.length / pageSize),
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture,
      })),
    };
  }
}
