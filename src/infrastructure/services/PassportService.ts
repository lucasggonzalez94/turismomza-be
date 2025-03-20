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
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
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

export { passport };

