import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { prisma } from "../prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error("Google OAuth environment variables are missing");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || "";
        const name =
          profile.displayName ||
          profile.name?.givenName ||
          (email ? email.split("@")[0] : "User");

        let user = await prisma.user.findUnique({ where: { googleId } });

        if (!user && email) {
          const existingByEmail = await prisma.user.findUnique({ where: { email } });

          if (existingByEmail) {
            user = await prisma.user.update({
              where: { id: existingByEmail.id },
              data: { googleId, name: existingByEmail.name || name },
            });
          }
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              name,
              email: email || `${googleId}@google.local`,
              googleId,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;