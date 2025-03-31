import { User } from "../entities/User";

export interface RefreshTokenRepository {
  save(userId: string, token: string): Promise<void>;
  findByToken(token: string): Promise<{ userId: string, userRole: string } | null>;
  deleteByUserId(userId: string): Promise<void>;
}
