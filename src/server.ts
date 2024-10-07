import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import advertisementsRoutes from "./routes/advertisementsRoutes";
import authRoutes from "./routes/authRoutes";
import attractionsRoutes from "./routes/attractionsRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import favoritesRoutes from "./routes/favoritesRoutes";
import notificationsRoutes from "./routes/notificationsRoutes";
import paymentsRoutes from "./routes/paymentsRoutes";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());

// Configuración de Web Socket
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use("/api/advertisements", advertisementsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attractions", attractionsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/payments", paymentsRoutes);

// Manejo de errores generales
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    __: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
