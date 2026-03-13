import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import passport from "passport";

import "./auth/passport";

import authRoutes from "./routes/auth.routes";
import applicationsRoutes from "./routes/applications.routes";
import matchRoutes from "./routes/match.routes";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is missing in environment variables");
}

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/applications", matchRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`JobTrackr API running on port ${PORT}`);
});