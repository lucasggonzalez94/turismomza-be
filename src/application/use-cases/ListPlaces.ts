// src/application/use-cases/ListPlaces.ts
import {
  PlaceRepository,
  ListPlacesFilters,
} from "../../domain/ports/PlaceRepository";
import { getMaxMinPrices } from "../../helpers/getMaxMinPrices";
import { shuffleArray } from "../../helpers/shuffleArray";

export class ListPlaces {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(
    filters: ListPlacesFilters & { creatorId?: string },
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
    const { total, places } = await this.placeRepository.listPlaces(
      filters,
      pagination
    );
    const page = pagination.page;
    const pageSize = pagination.pageSize;
    const totalPages = Math.ceil(total / pageSize);

    // Calcular rating promedio para cada Place
    const placesWithRating = places.map((place: any) => {
      const totalRatings = place.reviews.length;
      const sumRatings = place.reviews.reduce(
        (sum: number, review: any) => sum + (review.rating || 0),
        0
      );
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
      return { ...place, avgRating };
    });

    // Seleccionar lugares patrocinados: aquellos con algún anuncio activo (isActive true y endDate >= now)
    const sponsoredPlaces = shuffleArray(
      placesWithRating.filter((place: any) => {
        return place.advertisements.some(
          (ad: any) => ad.isActive && new Date(ad.endDate) >= new Date()
        );
      })
    );

    if (filters.sponsored) {
      return {
        total,
        page,
        pageSize,
        totalPages,
        minPrice: 0,
        maxPrice: 0,
        data: sponsoredPlaces,
      };
    }

    let finalPlaces: any[] = [];
    if (sponsoredPlaces.length > 0) {
      finalPlaces.push(sponsoredPlaces[0]);
    }

    // Filtrar los que no estén en patrocinados y eliminar la propiedad de anuncios
    const regularPlaces = placesWithRating
      .filter(
        (place: any) =>
          !sponsoredPlaces.some((s: any) => s.id === place.id)
      )
      .map(({ advertisements, ...rest }) => rest);

    // Intercalar anuncios patrocinados cada 6 lugares regulares
    const chunkSize = 6;
    let sponsoredIndex = 1;
    for (let i = 0; i < regularPlaces.length; i += chunkSize) {
      finalPlaces.push(...regularPlaces.slice(i, i + chunkSize));
      if (sponsoredIndex < sponsoredPlaces.length) {
        finalPlaces.push(sponsoredPlaces[sponsoredIndex]);
        sponsoredIndex++;
      }
    }

    // Marcar si el place es favorito para el usuario (si creatorId está presente en filters)
    const favoritePlaces = finalPlaces.map((place: any) => {
      const isFavorite = filters.creatorId
        ? place.favorites.some((fav: any) => fav.userId === filters.creatorId)
        : false;
      const { favorites, ...placeWithoutFavorites } = place;
      return { ...placeWithoutFavorites, isFavorite };
    });

    const { minPrice, maxPrice } = getMaxMinPrices(favoritePlaces);

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

export default ListPlaces;
