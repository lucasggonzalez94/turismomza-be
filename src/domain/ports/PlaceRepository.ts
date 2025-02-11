import { Place } from "../entities/Place";

export interface ListPlacesFilters {
  title?: string;
  creatorId?: string;
  categories?: string[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  sponsored?: boolean;
  rating?: number;
}

export interface PlaceRepository {
  createPlace(
    place: Place,
    images: { url: string; publicId: string; order: number }[]
  ): Promise<Place>;
  listPlaces(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: any[] }>;
}
