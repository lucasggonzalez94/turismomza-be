import bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.getByEmail(email);

    if (!user) throw new NotFoundError('El usuario no existe.');
    if (!user || !user.password) throw new UnauthorizedError("Credenciales inválidas.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Credenciales inválidas.");

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
