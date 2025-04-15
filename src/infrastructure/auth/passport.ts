import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaUserRepository } from "../database/PrismaUserRepository";
import { LoginWithGoogle } from "../../application/use-cases/Auth/LoginWithGoogle";
import { EmailService } from "../services/EmailService";
import { Request } from "express";
import { PrismaRefreshTokenRepository } from "../database/PrismaRefreshTokenRepository";

const userRepository = new PrismaUserRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();
const emailService = new EmailService();
const loginWithGoogle = new LoginWithGoogle(userRepository, refreshTokenRepository, emailService);

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req: Request, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(
              new Error("No se pudo obtener el email del perfil de Google"),
              false
            );
          }

          const { user, accessToken: token, refreshToken: refToken } = await loginWithGoogle.execute(
            profile.displayName || "Usuario de Google",
            email,
            profile.photos?.[0]?.value || "",
            profile.id
          );

          // Almacenar el token para usarlo en el callback
          req.accessToken = token;
          req.refreshToken = refToken;
          req.user = {
            userId: user.id,
            role: user.role,
            googleId: profile.id
          };

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userRepository.getById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
