import express, { Application } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import attractionsRoutes from './routes/attractionsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import ratingsRoutes from './routes/ratingsRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import notificationsRoutes from './routes/notificationsRoutes';

dotenv.config();

const app: Application = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Manejo de errores generales
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
