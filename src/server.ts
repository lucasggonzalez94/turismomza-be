import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import attractionsRoutes from './routes/attractionsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import ratingsRoutes from './routes/ratingsRoutes';
import favoritesRoutes from './routes/favoritesRoutes';

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

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Manejo de errores generales
app.use((err: Error, _: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
