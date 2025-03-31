import { PlaceRepository } from "../../../domain/ports/PlaceRepository";
import { CloudinaryService } from "../../../infrastructure/services/CloudinaryService";

export class DeletePlace {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(placeId: string, userId: string): Promise<void> {
    const images = await this.placeRepository.getImagesByPlaceId(placeId);
    await Promise.all(
      images.map(async (image) => {
        await CloudinaryService.destroyImage(image.publicId);
      })
    );
    await this.placeRepository.deletePlace(placeId, userId);
  }
}
