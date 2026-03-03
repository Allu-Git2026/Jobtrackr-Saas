import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * Express query values can be: string | string[] | undefined
 * Prisma expects: string | undefined
 */
function toStr(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
  return undefined;
}

function toStrRequired(v: unknown): string {
  const s = toStr(v);
  return s ?? "";
}

// ✅ GET /api/applications?status=&priority=&company=&roleTitle=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = toStrRequired(req.userId);

    const status = toStr(req.query.status);
    const priority = toStr(req.query.priority);
    const company = toStr(req.query.company);
    const roleTitle = toStr(req.query.roleTitle);

    const apps = await prisma.application.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(company ? { company: { contains: company, mode: "insensitive" } } : {}),
        ...(roleTitle ? { roleTitle: { contains: roleTitle, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(apps);
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to fetch applications" });
  }
});

// ✅ POST /api/applications
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = toStrRequired(req.userId);

    const {
      company,
      roleTitle,
      status,
      priority,
      jobUrl,
      location,
      notes,
      followUpAt,
    } = req.body;

    const created = await prisma.application.create({
      data: {
        userId,
        company,
        roleTitle,
        status,
        priority,
        jobUrl: jobUrl || null,
        location: location || null,
        notes: notes || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
      },
    });

    return res.json(created);
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to create application" });
  }
});

// ✅ PUT /api/applications/:id
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = toStrRequired(req.userId);
    const id = String(req.params.id); // ✅ force id to string

    const found = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!found) return res.status(404).json({ message: "Not found" });

    const {
      company,
      roleTitle,
      status,
      priority,
      jobUrl,
      location,
      notes,
      followUpAt,
    } = req.body;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        company,
        roleTitle,
        status,
        priority,
        jobUrl: jobUrl || null,
        location: location || null,
        notes: notes || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
      },
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update application" });
  }
});

// ✅ DELETE /api/applications/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = toStrRequired(req.userId);
    const id = String(req.params.id); // ✅ force id to string

    const found = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!found) return res.status(404).json({ message: "Not found" });

    await prisma.application.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to delete application" });
  }
});

export default router;