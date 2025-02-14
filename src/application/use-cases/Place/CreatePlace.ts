import { Place } from "../../../domain/entities/Place";
import { PlaceRepository } from "../../../domain/ports/PlaceRepository";
import { UserRepository } from "../../../domain/ports/UserRepository";
import { CloudinaryService } from "../../../infrastructure/services/CloudinaryService";
import { TextModerationService } from "../../../infrastructure/services/TextModerationService";
import { generateSlug } from "../../../helpers/generateSlug";

export interface CreatePlaceInput {
  title: string;
  description: string;
  location: string;
  category: string;
  schedule: string;
  services?: string[];
  contactNumber?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  price?: number;
  currencyPrice?: "ars" | "usd";
  files: Express.Multer.File[];
  userId: string;
  userRole: string;
}

export class CreatePlace {
  constructor(
    private placeRepository: PlaceRepository,
    private userRepository: UserRepository
  ) {}

  async execute(input: CreatePlaceInput): Promise<Place> {
    const textToModerate = `Título: ${input.title} Descripción: ${input.description}`;
    const isTextAppropriate = await TextModerationService.moderateText(
      textToModerate
    );
    if (!isTextAppropriate) {
      throw new Error("Inappropriate text detected");
    }

    const slug = await generateSlug(input.title);

    if (input.userRole === "viewer") {
      await this.userRepository.updateUserRole(input.userId, "publisher");
    }

    const uploadedImages: { url: string; publicId: string; order: number }[] =
      [];
    const uploadedPublicIds: string[] = [];

    for (let index = 0; index < input.files.length; index++) {
      const file = input.files[index];

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
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        order: index,
      });
    }

    const newPlace = new Place(
      "",
      input.title,
      slug,
      input.description,
      input.location,
      input.category,
      input.userId,
      new Date(),
      input.services || [],
      input.schedule,
      [],
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

    const createdPlace = await this.placeRepository.createPlace(
      newPlace,
      uploadedImages
    );
    return createdPlace;
  }
}
