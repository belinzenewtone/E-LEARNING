import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

// GET /api/weeks
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const weeks = await db.weekSprint.findMany({
    orderBy: { weekNumber: "asc" },
    select: {
      id: true, weekNumber: true, title: true, theme: true, phase: true,
      status: true, startDate: true, endDate: true, estimatedHours: true,
      retrospectiveCompleted: true, goals: true,
      _count: { select: { lessons: true, assignments: true } },
    },
  });
  res.json(weeks);
});

// GET /api/weeks/active
router.get("/active", async (_req: Request, res: Response): Promise<void> => {
  const week = await db.weekSprint.findFirst({
    where: { status: "active" },
    orderBy: { weekNumber: "asc" },
  });
  res.json(week ?? null);
});

// GET /api/weeks/:number
router.get("/:number", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const weekNumber = parseInt(req.params.number, 10);

  if (isNaN(weekNumber)) { res.status(400).json({ error: "Invalid week number" }); return; }

  const week = await db.weekSprint.findUnique({
    where: { weekNumber },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          module: { select: { title: true, slug: true } },
          progress: { where: { userId }, select: { status: true } },
        },
      },
      assignments: {
        include: {
          track: { select: { name: true, slug: true, color: true } },
          submissions: {
            where: { userId },
            select: { id: true, status: true, submittedAt: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!week) { res.status(404).json({ error: "Week not found" }); return; }

  res.json(week);
});

export default router;
