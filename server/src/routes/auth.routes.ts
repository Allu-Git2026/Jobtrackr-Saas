import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { prisma } from "../prisma";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// helper
function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// ✅ REGISTER (email/password)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken(user.id);
    return res.json({ token, user });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Register failed" });
  }
});

// ✅ LOGIN (email/password)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // user may be Google-only
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user.id);

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Login failed" });
  }
});

// ✅ GOOGLE LOGIN START
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// ✅ GOOGLE CALLBACK → issue JWT → redirect to client with token
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login` }),
  async (req: any, res) => {
    const user = req.user;
    const token = signToken(user.id);

    // redirect back to client with token
    return res.redirect(`${CLIENT_URL}/oauth-success?token=${token}`);
  },
);

export default router;