import { Place } from "../entities/Place";

export interface ListPlacesFilters {
  searchTerm?: string;
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
  editPlace(
    place: Place,
    images: { url: string; publicId: string; order: number }[]
  ): Promise<Place>;
  listPlaces(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; allPlaces: Place[], places: Place[] }>;
  listFavoritePlaces(
    userId: string,
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: Place[] }>;
  getById(slug: string): Promise<Place | null>;
  getBySlug(slug: string): Promise<Place | null>;
  deletePlace(placeId: string, userId: string): Promise<void>;
  getImagesByPlaceId(placeId: string): Promise<{ publicId: string }[]>;
}
