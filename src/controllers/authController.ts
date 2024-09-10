import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import { body, validationResult } from 'express-validator';

export const register = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  // TODO: Validar password
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: passwordBody, name } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(passwordBody, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'viewer',
          name
        },
      });
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '1h' }
      );
      const { id, password, two_factor_enabled, registration_date, ...restUser} = user;
      res.status(201).json({...restUser, token});
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  }
];

export const login = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  // TODO: Validar password
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
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
      res.json({ ...user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }
];
