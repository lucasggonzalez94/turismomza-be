import { Place } from "../entities/Place";
import { Image } from "../value-objects/Image";

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
  ): Promise<{ total: number; places: Place[] }>;
  getBySlug(slug: string): Promise<Place | null>;
  listPlacesByUser(
    filters: ListPlacesFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: Place[] }>;
  deletePlace(placeId: string, userId: string): Promise<void>;
  getImagesByPlaceId(placeId: string): Promise<{ public_id: string }[]>;
}
