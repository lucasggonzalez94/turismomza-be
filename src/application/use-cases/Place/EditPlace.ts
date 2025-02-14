import { Place } from "../../../domain/entities/Place";
import { PlaceRepository } from "../../../domain/ports/PlaceRepository";
import { CloudinaryService } from "../../../infrastructure/services/CloudinaryService";
import { TextModerationService } from "../../../infrastructure/services/TextModerationService";
import { generateSlug } from "../../../helpers/generateSlug";
import { CreatePlaceInput } from "./CreatePlace";

export class EditPlace {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(placeId: string, input: CreatePlaceInput): Promise<Place> {
    const textToModerate = `Título: ${input.title} Descripción: ${input.description}`;
    const isTextAppropriate = await TextModerationService.moderateText(
      textToModerate
    );
    if (!isTextAppropriate) {
      throw new Error("Inappropriate text detected");
    }

    const slug = await generateSlug(input.title);

    const uploadedImages: { id: string, url: string; publicId: string; order: number }[] =
      [];
    const uploadedPublicIds: string[] = [];

    for (let index = 0; index < input?.files?.length; index++) {
      const file = input?.files[index];

      const uploadResult = await CloudinaryService.uploadImage(file.buffer);
      if (!uploadResult?.url) {
        for (const publicId of uploadedPublicIds) {
          await CloudinaryService.destroyImage(publicId);
        }
        throw new Error("Error uploading image to Cloudinary");
      }
      uploadedPublicIds.push(uploadResult.publicId);

      const isImageAppropriate = await CloudinaryService.analyzeImage(
        uploadResult.url
      );
      if (!isImageAppropriate) {
        for (const publicId of uploadedPublicIds) {
          await CloudinaryService.destroyImage(publicId);
        }
        throw new Error("Inappropriate image detected");
      }
      uploadedImages.push({
        id: "",
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        order: index,
      });
    }

    const newPlace = new Place(
      placeId,
      input.title,
      slug,
      input.description,
      input.location,
      input.category,
      input.userId,
      new Date(),
      input.services || [],
      input.schedule,
      uploadedImages,
      [],
      [],
      [],
      input.contactNumber,
      input.email,
      input.website,
      input.instagram,
      input.facebook,
      input.price,
      input.currencyPrice
    );

    const editedPlace = await this.placeRepository.editPlace(
      newPlace,
      uploadedImages
    );
    return editedPlace;
  }
}
