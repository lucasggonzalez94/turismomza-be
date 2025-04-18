import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";

import userRoutes from "./application/routes/UserRoutes";
import placeRoutes from "./application/routes/PlaceRoutes";
import favoriteRoutes from "./application/routes/FavoriteRoutes";
import reviewRoutes from "./application/routes/ReviewRoutes";
import notificationRoutes from "./application/routes/NotificationRoutes";
import contactRoutes from "./application/routes/ContactRoutes";
import { configurePassport } from "./infrastructure/auth/passport";

const allowedOrigins = [
  "http://localhost:3000",
  "https://turismomza.vercel.app",
];

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    frameguard: { action: "deny" },
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "El CORS policy no permite acceso desde este origen.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(passport.initialize());
configurePassport();
app.use(express.json());

const userSockets: {
  [userId: string]: string;
} = {};

app.set("userSockets", userSockets);

// Configuración de Web Socket
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId: string = socket.handshake.query.userId as string;
  userSockets[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use("/api/auth", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
// app.use("/api/advertisements", advertisementsRoutes);
// app.use("/api/payments", paymentsRoutes);

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
