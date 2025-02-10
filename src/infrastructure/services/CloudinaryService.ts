import cloudinary from "cloudinary";
import { analyzeImage } from "../../helpers/analyzeImage";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadImage(
    fileBuffer: Buffer
  ): Promise<{ url: string; publicId: string } | null> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject("Cloudinary upload error");
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  static async destroyImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  static async analyzeImage(url: string): Promise<boolean> {
    return analyzeImage(url);
  }
}
