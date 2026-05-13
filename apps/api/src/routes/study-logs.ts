import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

const StudyLogSchema = z.object({
  minutes: z.number().int().min(1).max(1440),
  date: z.string().optional(),
  trackId: z.string().optional(),
  mood: z.enum(["great", "good", "okay", "tired", "frustrated"]).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  learned: z.string().max(2000).optional(),
  blockers: z.string().max(1000).optional(),
  nextStep: z.string().max(500).optional(),
});

// GET /api/study-logs
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { limit } = req.query;

  const logs = await db.studyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit ? parseInt(String(limit), 10) : undefined,
  });

  res.json(logs);
});

// POST /api/study-logs
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const parsed = StudyLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const { minutes, date, trackId, mood, energy, learned, blockers, nextStep } = parsed.data;
  const logDate = date ? new Date(date) : new Date();

  await db.$transaction([
    db.studyLog.create({ data: { userId, date: logDate, trackId, minutes, mood, energy, learned, blockers, nextStep } }),
    db.xpEvent.create({ data: { userId, trackId, type: "study-log", points: 10, reason: `Logged ${minutes} minutes of study` } }),
  ]);

  res.status(201).json({ success: true });
});

export default router;
