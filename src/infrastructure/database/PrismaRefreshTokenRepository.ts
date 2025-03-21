import { PrismaClient } from "@prisma/client";
import { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository";
import { RefreshToken } from "../../domain/entities/RefreshToken";

const prisma = new PrismaClient();

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async save(userId: string, token: RefreshToken): Promise<void> {
    const existingToken = await prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (existingToken) {
      await prisma.refreshToken.update({
        where: { userId },
        data: {
          id: token.id,
          token: token.token,
          expires_at: token.expiresAt,
        },
      });
    } else {
      await prisma.refreshToken.create({
        data: {
          id: token.id,
          userId: token.userId,
          token: token.token,
          expires_at: token.expiresAt,
        },
      });
    }
  }

  async findByToken(token: RefreshToken): Promise<RefreshToken | null> {
    const result = await prisma.refreshToken.findUnique({
      where: { token: token.token },
    });
    return result
      ? new RefreshToken(
          result.id,
          result.token,
          result.userId,
          result.createdAt,
          result.expires_at
        )
      : null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
