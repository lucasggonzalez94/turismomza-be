import { Request, Response } from "express";
import { AddOrRemoveFavorite } from "../../application/use-cases/Favorite/AddOrRemoveFavorite";
import { PrismaFavoriteRepository } from "../database/PrismaFavoriteRepository";
import ListFavoritesByUser from "../../application/use-cases/Favorite/ListFavoritesByUser";

const favoriteRepository = new PrismaFavoriteRepository();

const addOrRemoveFavorite = new AddOrRemoveFavorite(favoriteRepository);
const listFavoritesByUser = new ListFavoritesByUser(favoriteRepository);

export class FavoriteController {
  static async addOrRemove(req: Request, res: Response) {
    try {
      const { placeId } = req.body;
      const userId = req.user!.userId;

      const favorite = await addOrRemoveFavorite.execute(placeId, userId);
      if (favorite) {
        return res.status(201).json(favorite);
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error adding to favorites" });
    }
  }

  static async listByUser(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", pageSize = "10" } = req.query;
      const userId = req.user!.userId;

      const pagination = {
        page: parseInt(String(page), 10),
        pageSize: parseInt(String(pageSize), 10),
      };

      const result = await listFavoritesByUser.execute(userId, pagination);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Error listing favorite places" });
    }
  }
}
