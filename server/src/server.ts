import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import passport from "passport";

import "./auth/passport"; // ✅ IMPORTANT: initializes Google strategy

import authRoutes from "./routes/auth.routes";
import applicationsRoutes from "./routes/applications.routes";
import matchRoutes from "./routes/match.routes"; // if you have match-file route in separate file

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(passport.initialize());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationsRoutes);

// if you have separate match routes file, keep this (otherwise remove)
app.use("/api/applications", matchRoutes);

app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.listen(5001, () => {
  console.log("JobTrackr API running on http://localhost:5001");
});

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jobtrackr-client.vercel.app"
    ],
    credentials: true,
  })
);