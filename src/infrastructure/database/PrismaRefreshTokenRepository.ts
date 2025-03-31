import { PrismaClient } from "@prisma/client";
import { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository";

const prisma = new PrismaClient();

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async save(userId: string, token: string): Promise<void> {
    const existingToken = await prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true },
    });

    if (existingToken) {
      return;
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: token,
        },
      });
    }
  }

  async findByToken(token: string): Promise<{ userId: string, userRole: string } | null> {
    const user = await prisma.user.findUnique({
      where: { refreshToken: token },
      select: { id: true, role: true },
    });
    return user ? { userId: user.id, userRole: user.role } : null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
