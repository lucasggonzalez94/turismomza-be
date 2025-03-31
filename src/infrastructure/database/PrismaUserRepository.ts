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

  async createWithGoogle(
    name: string,
    email: string,
    image: string,
    googleId: string
  ): Promise<User> {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, googleImage: image, googleId },
      create: { email, name, googleImage: image, googleId, role: "viewer" },
    });

    return new User(
      user?.id,
      user?.name,
      user?.email,
      user?.role,
      user?.twoFactorEnabled
    );
  }

  async update(user: User): Promise<User | null> {
    if (user.profilePicture) {
      await prisma.profilePicture.upsert({
        where: { userId: user.id },
        update: {
          publicId: user.profilePicture.publicId,
          url: user.profilePicture.url,
        },
        create: {
          id: user.profilePicture.id,
          userId: user.id,
          publicId: user.profilePicture.publicId,
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
      include: { profilePicture: true },
    });

    return updatedUser
      ? new User(
          updatedUser.id,
          updatedUser.name,
          updatedUser.email,
          updatedUser.role,
          updatedUser.twoFactorEnabled,
          updatedUser.password ?? undefined,
          updatedUser.googleId ?? undefined,
          updatedUser.googleImage ?? undefined,
          updatedUser.twoFactorCode ?? undefined,
          updatedUser.twoFactorExpires ?? undefined,
          updatedUser.bio ?? undefined,
          updatedUser.location ?? undefined,
          updatedUser.website ?? undefined,
          updatedUser.language ?? undefined,
          updatedUser.verified ?? undefined,
          updatedUser.createdAt,
          updatedUser.profilePicture
            ? new ProfilePicture(
                updatedUser.profilePicture.id,
                updatedUser.profilePicture.publicId,
                updatedUser.profilePicture.url
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
      include: { profilePicture: true, places: true, reviews: true },
    });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.role,
          user.twoFactorEnabled,
          user.password ?? undefined,
          user.googleId ?? undefined,
          user.googleImage ?? undefined,
          user.twoFactorCode ?? undefined,
          user.twoFactorExpires ?? undefined,
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
          user.createdAt,
          user.profilePicture
            ? new ProfilePicture(
                user.profilePicture.id,
                user.profilePicture.publicId,
                user.profilePicture.url
              )
            : undefined,
          user?.places?.length || 0,
          user?.reviews?.length || 0
        )
      : null;
  }

  async getByGoogleId(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { googleId: id },
      include: { profilePicture: true, places: true, reviews: true },
    });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.role,
          user.twoFactorEnabled,
          user.password ?? undefined,
          user.googleId ?? undefined,
          user.googleImage ?? undefined,
          user.twoFactorCode ?? undefined,
          user.twoFactorExpires ?? undefined,
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
          user.createdAt,
          user.profilePicture
            ? new ProfilePicture(
                user.profilePicture.id,
                user.profilePicture.publicId,
                user.profilePicture.url
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
      include: { profilePicture: true },
    });
    return user
      ? new User(
          user.id,
          user.name,
          user.email,
          user.role,
          user.twoFactorEnabled,
          user.password ?? undefined,
          user.googleId ?? undefined,
          user.googleImage ?? undefined,
          user.twoFactorCode ?? undefined,
          user.twoFactorExpires ?? undefined,
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
          user.createdAt,
          user.profilePicture
            ? new ProfilePicture(
                user.profilePicture.id,
                user.profilePicture.publicId,
                user.profilePicture.url
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
        profilePicture: true,
      },
    });
    return users.map(
      (user) =>
        new User(
          user.id,
          user.name,
          user.email,
          user.role,
          user.twoFactorEnabled,
          user.password ?? undefined,
          user.googleId ?? undefined,
          user.googleImage ?? undefined,
          user.twoFactorCode ?? undefined,
          user.twoFactorExpires ?? undefined,
          user.bio ?? undefined,
          user.location ?? undefined,
          user.website ?? undefined,
          user.language ?? undefined,
          user.verified ?? undefined,
          user.createdAt,
          user.profilePicture
            ? new ProfilePicture(
                user.profilePicture.id,
                user.profilePicture.publicId,
                user.profilePicture.url
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
