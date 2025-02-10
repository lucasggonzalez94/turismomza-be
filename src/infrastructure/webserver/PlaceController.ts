import { Request, Response } from "express";
import { CreatePlace } from "../../application/use-cases/CreatePlace";
import { PrismaPlaceRepository } from "../database/PrismaPlaceRepository";
import { PrismaUserRepository } from "../database/PrismaUserRepository";

const placeRepository = new PrismaPlaceRepository();
const userRepository = new PrismaUserRepository();
const createPlace = new CreatePlace(placeRepository, userRepository);

export class PlaceController {
  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        location,
        category,
        contactNumber,
        email,
        website,
        instagram,
        facebook,
        schedule,
        price,
        currencyPrice,
        services,
      } = req.body;

      let parsedServices: string[] = [];
      if (services) {
        parsedServices = JSON.parse(services);
      }

      const input = {
        title,
        description,
        location,
        category,
        schedule,
        services: parsedServices,
        contactNumber,
        email,
        website,
        instagram,
        facebook,
        price: price ? parseFloat(price) : undefined,
        currencyPrice,
        files: req.files as Express.Multer.File[],
        userId: req.user!.userId,
        userRole: req.user!.role,
      };

      const place = await createPlace.execute(input);
      res.status(201).json(place);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating place" });
    }
  }
}
