import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { prisma } from "../prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const googleId = profile.id; // always string
        const email = profile.emails?.[0]?.value || "";
        const name =
          profile.displayName ||
          profile.name?.givenName ||
          (email ? email.split("@")[0] : "User");

        // 1) find by googleId
        let user = await prisma.user.findUnique({ where: { googleId } });

        // 2) if not found, link by email (if exists)
        if (!user && email) {
          const existingByEmail = await prisma.user.findUnique({ where: { email } });

          if (existingByEmail) {
            user = await prisma.user.update({
              where: { id: existingByEmail.id },
              data: { googleId, name: existingByEmail.name || name },
            });
          }
        }

        // 3) create user if still missing
        if (!user) {
          user = await prisma.user.create({
            data: {
              name,
              email: email || `${googleId}@google.local`,
              googleId,
              // password is optional => do not set it
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;