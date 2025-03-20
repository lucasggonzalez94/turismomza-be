import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaUserRepository } from '../database/PrismaUserRepository';
import { GoogleAuthUser } from '../../application/use-cases/Auth/GoogleAuthUser';

const userRepository = new PrismaUserRepository();
const googleAuthUser = new GoogleAuthUser(userRepository);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { user } = await googleAuthUser.execute({
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails || [],
          photos: profile.photos || [],
        });
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialización y deserialización de usuario
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export { passport };
