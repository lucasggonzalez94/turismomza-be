import { Favorite } from "../../domain/entities/Favorite";
import { FavoriteRepository } from "../../domain/ports/FavoriteRepository";

export class AddOrRemoveFavorite {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(placeId: string, userId: string): Promise<Favorite | void> {
    const favorite = await this.favoriteRepository.addOrRemove(placeId, userId);

    if (favorite) {
      return favorite;
    }
  }
}
