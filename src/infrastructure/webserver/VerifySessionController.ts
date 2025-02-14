import { Request, Response } from "express";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { VerifySession } from "../../application/use-cases/Auth/VerifySession";

const userRepository = new PrismaUserRepository();
const verifySession = new VerifySession(userRepository);

export class VerifyTokenController {
  static async handle(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await verifySession.execute(userId);
      res.status(200).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(401).json({ error: errorMessage });
    }
  }
}
