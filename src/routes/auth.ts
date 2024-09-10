import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router: Router = Router();
const prisma = new PrismaClient();

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' });
    res.json({ accessToken });

  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Credenciales incorrectas.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Credenciales incorrectas.' });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' });
    res.json({ accessToken });

  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

export default router;
