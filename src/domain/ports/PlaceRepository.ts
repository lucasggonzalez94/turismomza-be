import { Place } from "../entities/Place";

export interface PlaceRepository {
  create(
    place: Place,
    images: { url: string; publicId: string; order: number }[]
  ): Promise<Place>;
}
