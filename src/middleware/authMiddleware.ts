import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware para autenticar el token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Extrae el token del encabezado de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'No token provided' });

  // Define el callback para la verificación del token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    // El tipo de decoded es JwtPayload o undefined
    if (decoded && typeof decoded !== 'string') {
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
      next();
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  });
};

export default authenticateToken;