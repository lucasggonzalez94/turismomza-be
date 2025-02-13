import { Favorite } from "../entities/Favorite";

export interface FavoriteRepository {
  addOrRemove(placeId: string, userId: string): Promise<Favorite | void>;
  getByUser(userId: string): Promise<Favorite[]>;
}
