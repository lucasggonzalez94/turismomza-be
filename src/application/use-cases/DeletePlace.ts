import { Place } from "../../domain/entities/Place";
import { PlaceRepository } from "../../domain/ports/PlaceRepository";
import { UserRepository } from "../../domain/ports/UserRepository";
import { CloudinaryService } from "../../infrastructure/services/CloudinaryService";
import { TextModerationService } from "../../infrastructure/services/TextModerationService";
import { generateSlug } from "../../helpers/generateSlug";
import { Image } from "../../domain/value-objects/Image";

export class DeletePlace {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(placeId: string, userId: string): Promise<void> {
    const images = await this.placeRepository.getImagesByPlaceId(placeId);
    await Promise.all(
      images.map(async (image) => {
        await CloudinaryService.destroyImage(image.public_id);
      })
    );
    await this.placeRepository.deletePlace(placeId, userId);
  }
}
