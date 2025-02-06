import { UserRepository } from "../ports/UserRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(data: { email: string; password: string }) {
    const user = await this.userRepository.getByEmail(data.email);
    if (!user) throw new Error("Usuario no encontrado.");

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error("Contraseña incorrecta.");

    // TODO: Implementar 2FA
    // if (user.twoFactorEnabled) {
    //   const code = Math.floor(100000 + Math.random() * 900000).toString();
    //   user.enableTwoFactorAuth(code);
    //   await this.userRepository.update(user);
    //   return { message: "Código de 2FA enviado." };
    // }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    return { user, accessToken };
  }
}
