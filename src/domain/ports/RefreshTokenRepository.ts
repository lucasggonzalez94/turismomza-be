import { RefreshToken } from "../entities/RefreshToken";

export interface RefreshTokenRepository {
  save(userId: string, token: RefreshToken): Promise<void>;
  findByToken(token: RefreshToken): Promise<RefreshToken | null>;
}
