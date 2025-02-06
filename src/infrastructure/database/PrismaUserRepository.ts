import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../domain/ports/UserRepository";
import { User } from "../../domain/entities/User";
import { ProfilePicture } from "../../domain/value-objects/ProfilePicture";

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

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });

    if (user.profilePicture) {
      await prisma.profilePicture.upsert({
        where: { userId: user.id },
        update: {
          public_id: user.profilePicture.public_id,
          url: user.profilePicture.url,
        },
        create: {
          id: user.profilePicture.id,
          userId: user.id,
          public_id: user.profilePicture.public_id,
          url: user.profilePicture.url,
        },
      });
    }
  }

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
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile_picture: true },
    });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.two_factor_enabled,
          user.two_factor_code ?? undefined,
          user.two_factor_expires ?? undefined,
          user.created_at,
          user.profile_picture
            ? new ProfilePicture(
                user.profile_picture.id,
                user.profile_picture.public_id,
                user.profile_picture.url
              )
            : undefined
        )
      : null;
  }

  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      include: { profile_picture: true, places: true },
    });
    return users.map(
      (user) =>
        new User(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.two_factor_enabled,
          user.two_factor_code ?? undefined,
          user.two_factor_expires ?? undefined,
          user.created_at,
          user.profile_picture
            ? new ProfilePicture(
                user.profile_picture.id,
                user.profile_picture.public_id,
                user.profile_picture.url
              )
            : undefined
        )
    );
  }
}
