import { User } from "../entities/User";

export interface UserRepository {
  create(user: User): Promise<void>;
  createWithGoogle(
    name: string,
    email: string,
    image: string,
    googleId: string
  ): Promise<User>;
  update(user: User): Promise<User | null>;
  delete(user: User): Promise<void>;
  getById(id: string): Promise<User | null>;
  getByGoogleId(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getAll(page: number, pageSize: number): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
}
