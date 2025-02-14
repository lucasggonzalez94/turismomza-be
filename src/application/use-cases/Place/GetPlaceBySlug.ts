import { PlaceRepository } from "../../../domain/ports/PlaceRepository";

export class GetPlaceBySlug {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(slug: string, userId?: string) {
    const place = await this.placeRepository.getBySlug(slug);
    if (!place) {
      throw new Error("Place not found");
    }

    const isFavorite = place.favorites.some((fav) => fav.userId === userId);
    return { ...place, isFavorite };
  }
}
