import { UserRepository } from "../../../domain/ports/UserRepository";

export class UnlinkGoogleAccount {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.getById(userId);
    
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    if (!user.hasPassword) {
      throw new Error("Debes establecer una contraseña antes de desvincular tu cuenta de Google");
    }
    
    user.googleId = undefined;
    const updatedUser = await this.userRepository.update(user);
    
    if (!updatedUser) {
      throw new Error("Error al actualizar el usuario");
    }
    
    return updatedUser;
  }
}
