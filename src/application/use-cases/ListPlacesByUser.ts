import {
  PlaceRepository,
  ListPlacesFilters,
} from "../../domain/ports/PlaceRepository";
import { getMaxMinPrices } from "../../helpers/getMaxMinPrices";

export class ListPlacesByUser {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    minPrice: number;
    maxPrice: number;
    data: any[];
  }> {
    const { total, places } = await this.placeRepository.listPlacesByUser(
      filters,
      pagination
    );
    const page = pagination.page;
    const pageSize = pagination.pageSize;
    const totalPages = Math.ceil(total / pageSize);

    // Calcular rating promedio para cada Place
    const placesWithRating = places.map((place: any) => {
      const totalRatings = place?.reviews?.length;
      const sumRatings = place?.reviews?.reduce(
        (sum: number, review: any) => sum + (review.rating || 0),
        0
      );
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
      return { ...place, avgRating };
    });

    const { minPrice, maxPrice } = getMaxMinPrices(placesWithRating);

    return {
      total,
      page,
      pageSize,
      totalPages,
      minPrice,
      maxPrice,
      data: placesWithRating,
    };
  }
}

export default ListPlacesByUser;
