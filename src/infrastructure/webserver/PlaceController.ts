import { Request, Response } from "express";
import { CreatePlace } from "../../application/use-cases/CreatePlace";
import { PrismaPlaceRepository } from "../database/PrismaPlaceRepository";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { ListPlaces } from "../../application/use-cases/ListPlaces";
import { GetPlaceBySlug } from "../../application/use-cases/GetPlaceBySlug";
import ListPlacesByUser from "../../application/use-cases/ListPlacesByUser";
import { EditPlace } from "../../application/use-cases/EditPlace";
import { DeletePlace } from "../../application/use-cases/DeletePlace";

const placeRepository = new PrismaPlaceRepository();
const userRepository = new PrismaUserRepository();

const createPlace = new CreatePlace(placeRepository, userRepository);
const editPlace = new EditPlace(placeRepository);
const listPlaces = new ListPlaces(placeRepository);
const getPlaceBySlug = new GetPlaceBySlug(placeRepository);
const listPlacesByUser = new ListPlacesByUser(placeRepository);
const deletePlace = new DeletePlace(placeRepository);

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

  static async edit(req: Request, res: Response) {
    try {
      const { id } = req.params;
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

      const place = await editPlace.execute(id, input);
      res.status(201).json(place);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error editing place" });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        categories,
        location,
        priceMin,
        priceMax,
        sponsored,
        rating,
        page = "1",
        pageSize = "10",
      } = req.query;
      const userId = req?.user?.userId;

      const filters = {
        title: title ? String(title) : undefined,
        creatorId: userId ? String(userId) : undefined,
        categories: categories
          ? Array.isArray(categories)
            ? categories.map(String)
            : [String(categories)]
          : undefined,
        location: location ? String(location) : undefined,
        priceMin: priceMin ? parseFloat(String(priceMin)) : undefined,
        priceMax: priceMax ? parseFloat(String(priceMax)) : undefined,
        sponsored: sponsored === "true" ? true : undefined,
        rating: rating ? parseInt(String(rating), 10) : undefined,
      };

      const pagination = {
        page: parseInt(String(page), 10),
        pageSize: parseInt(String(pageSize), 10),
      };

      const result = await listPlaces.execute(filters, pagination);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Error listing places" });
    }
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const { userId } = req.query;

    try {
      const place = await getPlaceBySlug.execute(slug, userId as string);
      res.json(place);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(errorMessage === "Place not found" ? 404 : 500)
        .json({ error: errorMessage });
    }
  }

  static async listByUser(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        categories,
        location,
        priceMin,
        priceMax,
        rating,
        page = "1",
        pageSize = "10",
      } = req.query;

      const userId = req.user!.userId;

      const filters = {
        title: title ? String(title) : undefined,
        description: description ? String(description) : undefined,
        creatorId: userId ? String(userId) : undefined,
        categories: categories
          ? Array.isArray(categories)
            ? categories.map(String)
            : [String(categories)]
          : undefined,
        location: location ? String(location) : undefined,
        priceMin: priceMin ? parseFloat(String(priceMin)) : undefined,
        priceMax: priceMax ? parseFloat(String(priceMax)) : undefined,
        rating: rating ? parseInt(String(rating), 10) : undefined,
      };

      const pagination = {
        page: parseInt(String(page), 10),
        pageSize: parseInt(String(pageSize), 10),
      };

      const result = await listPlacesByUser.execute(filters, pagination);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Error listing places" });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
      await deletePlace.execute(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting place" });
    }
  }
}
