import { User } from "../entities/User";

export interface UserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getAll(page: number, pageSize: number): Promise<User[]>;
}