import { Router } from "express";
import fs from "fs";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * normalize unknown values to string | undefined
 */
function toStr(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
  return undefined;
}

function toStrRequired(v: unknown): string {
  return toStr(v) ?? "";
}

/**
 * POST /api/match/:applicationId
 * Body can include resumeText/jobDescriptionText (optional)
 */
router.post("/:applicationId", requireAuth, async (req: AuthRequest, res) => {
  try {
    // ✅ force both to string
    const userId = toStrRequired(req.userId);
    const applicationId = String(req.params.applicationId);

    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });

    if (!app) return res.status(404).json({ message: "Application not found" });

    // normalize text inputs
    const resumeText = toStr(req.body?.resumeText) ?? null;
    const jobDescriptionText = toStr(req.body?.jobDescriptionText) ?? null;

    // TODO: replace these stubs with your real AI logic
    const aiMatchScore = 80;
    const aiMatchSummary = "AI match generated successfully";
    const aiStrengths = "Strong React/TypeScript experience";
    const aiGaps = "Add more CI/CD testing keywords";
    const aiMissingKeywords = "Jest, Cypress";

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        resumeText,
        jobDescriptionText,
        aiMatchScore,
        aiMatchSummary,
        aiStrengths,
        aiGaps,
        aiMissingKeywords,
        aiLastMatchedAt: new Date(),
      },
    });

    // cleanup uploaded files if you had them in req (optional)
    // (keep this safe even if files don't exist)
    try {
      const resumeFile = (req as any).files?.resume?.[0];
      const jdFile = (req as any).files?.jobDescription?.[0];

      if (resumeFile?.path) fs.unlinkSync(resumeFile.path);
      if (jdFile?.path) fs.unlinkSync(jdFile.path);
    } catch (_) {
      // ignore cleanup errors
    }

    return res.json({ message: "AI match generated", application: updated });
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message || "Failed to generate AI match",
    });
  }
});

export default router;