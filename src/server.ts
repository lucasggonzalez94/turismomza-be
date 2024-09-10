import express, { Application, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import atraccionesRoutes from './routes/attractions';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

app.use(express.json());

const PORT = process.env.PORT || 3000;

interface JwtPayload {
  userId: number;
  role: string;
}

// Middleware de autenticación JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as JwtPayload;
    next();
  });
};

// Middleware de roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req?.user?.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};

app.use('/api/auth', authRoutes);
app.use('/api/attractions', atraccionesRoutes);

// Manejo de errores generales
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
