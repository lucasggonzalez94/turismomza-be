import { UserE } from "../entities/User";

export interface UserRepository {
  create(user: UserE): Promise<void>;
  createWithGoogle(
    name: string,
    email: string,
    image: string,
    googleId: string
  ): Promise<UserE>;
  update(user: UserE): Promise<UserE | null>;
  delete(user: UserE): Promise<void>;
  getById(id: string): Promise<UserE | null>;
  getByEmail(email: string): Promise<UserE | null>;
  getAll(page: number, pageSize: number): Promise<UserE[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
}
