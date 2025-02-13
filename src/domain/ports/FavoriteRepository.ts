import { Favorite } from "../entities/Favorite";
import { Place } from "../entities/Place";

export interface FavoriteRepository {
  addOrRemove(placeId: string, userId: string): Promise<Favorite | void>;
  getByUser(
    userId: string,
    pagination: { page: number; pageSize: number }
  ): Promise<{ total: number; places: Place[] }>;
}
