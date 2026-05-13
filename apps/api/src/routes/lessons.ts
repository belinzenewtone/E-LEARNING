import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

// GET /api/lessons/:slug
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { slug } = req.params;

  const lesson = await db.lesson.findUnique({
    where: { slug },
    include: {
      module: { include: { track: true } },
      week: true,
      notes: { where: { userId }, orderBy: { createdAt: "desc" } },
      checkpointAnswers: { where: { userId }, orderBy: { questionIndex: "asc" } },
      progress: { where: { userId }, select: { status: true, completedAt: true } },
    },
  });

  if (!lesson) { res.status(404).json({ error: "Lesson not found" }); return; }

  res.json(lesson);
});

// GET /api/lessons/by-week/:weekId
router.get("/by-week/:weekId", async (req: Request, res: Response): Promise<void> => {
  const { weekId } = req.params;

  const lessons = await db.lesson.findMany({
    where: { weekId },
    orderBy: { order: "asc" },
    include: { module: { select: { id: true, title: true, slug: true } } },
  });

  res.json(lessons);
});

// GET /api/lessons/track/:trackSlug/modules
router.get("/track/:trackSlug/modules", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { trackSlug } = req.params;

  const track = await db.track.findUnique({
    where: { slug: trackSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { progress: { where: { userId }, select: { status: true } } },
          },
        },
      },
    },
  });

  if (!track) { res.status(404).json({ error: "Track not found" }); return; }

  const modules = track.modules.map((mod) => {
    const total = mod.lessons.length;
    const completed = mod.lessons.filter((l) => l.status === "completed").length;
    return {
      ...mod,
      lessonCount: total,
      completedCount: completed,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  res.json({ ...track, modules });
});

export default router;
