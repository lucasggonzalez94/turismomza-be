import { Place } from "../../../domain/entities/Place";
import {
  PlaceRepository,
  ListPlacesFilters,
} from "../../../domain/ports/PlaceRepository";
import { getMaxMinPrices } from "../../../helpers/getMaxMinPrices";

export class ListFavoritePlaces {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(
    userId: string,
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    minPrice: number;
    maxPrice: number;
    data: Place[];
  }> {
    const { total, places } = await this.placeRepository.listFavoritePlaces(
      userId,
      filters,
      pagination
    );
    
    const page = pagination.page;
    const pageSize = pagination.pageSize;
    const totalPages = Math.ceil(total / pageSize);

    const placesWithRating = places.map((place: any) => {
      const totalRatings = place.reviews.length;
      const sumRatings = place.reviews.reduce(
        (sum: number, review: any) => sum + (review.rating || 0),
        0
      );
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
      return { ...place, avgRating };
    });

    const favoritePlaces = placesWithRating.map((place: any) => {
      const { favorites, ...placeWithoutFavorites } = place;
      return { ...placeWithoutFavorites, isFavorite: true };
    });

    const { minPrice, maxPrice } = getMaxMinPrices(places);

    return {
      total,
      page,
      pageSize,
      totalPages,
      minPrice,
      maxPrice,
      data: favoritePlaces,
    };
  }
}
