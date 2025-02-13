import { Request, Response } from "express";
import { AddOrRemoveFavorite } from "../../application/use-cases/AddOrRemoveFavorite";
import { PrismaFavoriteRepository } from "../database/PrismaFavoriteRepository";

const favoriteRepository = new PrismaFavoriteRepository();
const addOrRemoveFavorite = new AddOrRemoveFavorite(favoriteRepository);

export class FavoriteController {
  static async addOrRemove(req: Request, res: Response) {
    try {
      const { placeId } = req.body;
      const userId = req.user?.userId;

      const favorite = await addOrRemoveFavorite.execute(placeId, userId);
      if (favorite) {
        res.status(201).json(favorite);
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error adding to favorites" });
    }
  }
}
