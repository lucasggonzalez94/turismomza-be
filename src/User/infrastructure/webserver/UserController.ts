import { Request, Response } from "express";
import { RegisterUser } from "../../domain/use-cases/RegisterUser";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { LoginUser } from "../../domain/use-cases/LoginUser";

const userRepository = new PrismaUserRepository();

const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const user = await registerUser.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await loginUser.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({ error: errorMessage });
    }
  }
}
