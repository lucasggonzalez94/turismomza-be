import { UserRepository } from "../../../domain/ports/UserRepository";

export class LinkGoogleAccount {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, googleId: string) {
    if (!googleId) {
      throw new Error("ID de Google no proporcionado");
    }

    const existingUser = await this.userRepository.getByGoogleId(googleId);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Esta cuenta de Google ya está vinculada a otro usuario");
    }

    const currentUser = await this.userRepository.getById(userId);
    if (!currentUser) {
      throw new Error("Usuario no encontrado");
    }

    currentUser.googleId = googleId;
    const updatedUser = await this.userRepository.update(currentUser);
    
    if (!updatedUser) {
      throw new Error("Error al actualizar el usuario");
    }
    
    return updatedUser;
  }
}
