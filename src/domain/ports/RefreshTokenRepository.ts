import { RefreshToken } from "../entities/RefreshToken";

export interface RefreshTokenRepository {
  save(userId: string, token: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  delete(token: string): Promise<void>;
}
