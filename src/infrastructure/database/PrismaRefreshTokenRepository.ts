import { PrismaClient } from "@prisma/client";
import { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository";

const prisma = new PrismaClient();

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async save(userId: string, token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { refreshToken: true },
    });

    if (user?.refreshToken) {
      // Si ya existe un token, lo actualizamos
      await prisma.refreshToken.update({
        where: { userId: userId },
        data: {
          token: token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      });
    } else {
      // Si no existe, lo creamos
      await prisma.refreshToken.create({
        data: {
          id: userId, // Usando el userId como id del token
          token: token,
          userId: userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      });
    }
  }

  async findByToken(token: string): Promise<{ userId: string, userRole: string } | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: token },
      include: { user: true },
    });
    
    return refreshToken ? { userId: refreshToken.userId, userRole: refreshToken.user.role } : null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { userId: userId },
    });
    
    if (refreshToken) {
      await prisma.refreshToken.delete({
        where: { userId: userId },
      });
    }
  }
}
