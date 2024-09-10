import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import { body, validationResult } from 'express-validator';

export const register = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'viewer',
          name
        },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error registering user' });
    }
  }
];

export const login = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }
];
