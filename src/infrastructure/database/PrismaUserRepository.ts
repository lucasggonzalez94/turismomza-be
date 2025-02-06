import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../domain/ports/UserRepository";
import { User } from "../../domain/entities/User";

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
  }

  // TODO: Implementar update
  // async update(user: User): Promise<void> {
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       name: user.name,
  //       email: user.email,
  //       password: user.password,
  //       profile_picture: user.profilePicture,
  //     },
  //   });
  // }

  async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.two_factor_enabled
        )
      : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.two_factor_enabled
        )
      : null;
  }

  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(
      (user) =>
        new User(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.two_factor_enabled
        )
    );
  }
}
