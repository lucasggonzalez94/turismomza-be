import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

import authRoutes from './routes/authRoutes';
import attractionsRoutes from './routes/attractionsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import notificationsRoutes from './routes/notificationsRoutes';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Configuración de Web Socket
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

try {
  console.log('Running migrations...');
  execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma');
  console.log('Migrations completed successfully');
} catch (err) {
  console.error('Error running migrations:', err);
}

app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Manejo de errores generales
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
