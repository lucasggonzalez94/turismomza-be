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

  async update(user: User): Promise<User | null> {
    if (user.profilePicture) {
      await prisma.profilePicture.upsert({
        where: { user_id: user.id },
        update: {
          public_id: user.profilePicture.public_id,
          url: user.profilePicture.url,
        },
        create: {
          id: user.profilePicture.id,
          user_id: user.id,
          public_id: user.profilePicture.public_id,
          url: user.profilePicture.url,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        language: user.language,
        verified: user.verified,
      },
      include: { profile_picture: true },
    });

    return updatedUser
      ? new User(
          updatedUser.id,
          updatedUser.name,
          updatedUser.email,
          updatedUser.password,
          updatedUser.role,
          updatedUser.two_factor_enabled,
          updatedUser.two_factor_code ?? undefined,
          updatedUser.two_factor_expires ?? undefined,
          updatedUser.bio ?? undefined,
          updatedUser.location ?? undefined,
          updatedUser.website ?? undefined,
          updatedUser.language ?? undefined,
          updatedUser.verified ?? undefined,
          updatedUser.created_at,
          updatedUser.profile_picture
            ? new ProfilePicture(
                updatedUser.profile_picture.id,
                updatedUser.profile_picture.public_id,
                updatedUser.profile_picture.url
              )
            : undefined
        )
      : null;
  }

  async delete(user: User): Promise<void> {
    await prisma.user.delete({
      where: { id: user.id },
    });
  }

  async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile_picture: true, places: true, reviews: true },
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
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
          user.created_at,
          user.profile_picture
            ? new ProfilePicture(
                user.profile_picture.id,
                user.profile_picture.public_id,
                user.profile_picture.url
              )
            : undefined,
          user?.places?.length || 0,
          user?.reviews?.length || 0
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
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
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

  async getAll(page: number, pageSize: number): Promise<User[]> {
    const skip = (page - 1) * pageSize;

    const users = await prisma.user.findMany({
      skip,
      take: pageSize,
      include: {
        profile_picture: true,
      },
    });
    return users.map(
      (user) =>
        new User(
          user.id,
          user.name,
          user.email,
          user.password ?? undefined,
          user.role,
          user.two_factor_enabled,
          user.two_factor_code ?? undefined,
          user.two_factor_expires ?? undefined,
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
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

  async updateUserRole(
    userId: string,
    role: "viewer" | "publisher" | "admin"
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
