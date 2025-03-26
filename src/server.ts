import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { passport } from "./infrastructure/services/PassportService";

import userRoutes from "./application/routes/UserRoutes";
import placeRoutes from "./application/routes/PlaceRoutes";
import favoriteRoutes from "./application/routes/FavoriteRoutes";
import reviewRoutes from "./application/routes/ReviewRoutes";
import notificationRoutes from "./application/routes/NotificationRoutes";
import contactRoutes from "./application/routes/ContactRoutes";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://turismomza.vercel.app']
      : ['http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    frameguard: { action: "deny" },
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true,
  })
);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://turismomza.vercel.app']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Inicializar Passport y restaurar estado de autenticación desde la sesión
app.use(passport.initialize());
app.use(passport.session());

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
