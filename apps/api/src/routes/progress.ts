import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";
import { sm2 } from "../lib/spaced-repetition";

const router = Router();

router.use(authenticate);

// POST /api/progress/lessons/:id/complete
router.post("/lessons/:id/complete", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const lessonId = req.params.id;

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true, weekId: true } });
  if (!lesson) { res.status(404).json({ error: "Lesson not found" }); return; }

  const already = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (already?.status === "completed") { res.json({ success: true, alreadyCompleted: true }); return; }

  await db.$transaction(async (tx) => {
    await tx.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: "completed", completedAt: new Date() },
      create: { userId, lessonId, status: "completed", completedAt: new Date() },
    });
    await tx.xpEvent.create({
      data: { userId, lessonId, type: "lesson-complete", points: 20, reason: "Lesson completed" },
    });
    await tx.lesson.update({ where: { id: lessonId }, data: { status: "completed" } });
  });

  // Unlock the next lesson in the same week
  const completedLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { weekId: true, order: true },
  });
  if (completedLesson) {
    const next = await db.lesson.findFirst({
      where: { weekId: completedLesson.weekId, order: completedLesson.order + 1, status: "locked" },
    });
    if (next) {
      await db.lesson.update({ where: { id: next.id }, data: { status: "available" } });
    }
  }

  res.json({ success: true });
});

// POST /api/progress/lessons/:id/checkpoint-answers
const CheckpointSchema = z.object({
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    answer: z.string(),
    quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  })),
});

router.post("/lessons/:id/checkpoint-answers", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const lessonId = req.params.id;

  const parsed = CheckpointSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const { answers } = parsed.data;
  if (answers.length === 0) { res.json({ success: true }); return; }

  const existing = await db.lessonCheckpointAnswer.findMany({
    where: { userId, lessonId, questionIndex: { in: answers.map((a) => a.questionIndex) } },
  });
  const existingMap = new Map(existing.map((a) => [a.questionIndex, a]));

  await db.$transaction(
    answers.map(({ questionIndex, answer, quality }) => {
      const prev = existingMap.get(questionIndex);
      const card = {
        repetitions: prev?.repetitions ?? 0,
        interval: prev?.interval ?? 1,
        easeFactor: prev?.easeFactor ?? 2.5,
      };
      const result = sm2(card, quality);
      return db.lessonCheckpointAnswer.upsert({
        where: { userId_lessonId_questionIndex: { userId, lessonId, questionIndex } },
        update: { answer, ...result },
        create: { userId, lessonId, questionIndex, answer, ...result },
      });
    })
  );

  res.json({ success: true });
});

// POST /api/progress/assignments/:id/submit
const SubmitSchema = z.object({
  repoUrl: z.string().url().optional().or(z.literal("")),
  deploymentUrl: z.string().url().optional().or(z.literal("")),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
  sqlScriptUrl: z.string().url().optional().or(z.literal("")),
  reflection: z.string().max(5000).optional(),
  selfScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
});

router.post("/assignments/:id/submit", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const assignmentId = req.params.id;

  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const assignment = await db.assignment.findUnique({ where: { id: assignmentId }, select: { xpReward: true } });
  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }

  const existing = await db.submission.findFirst({
    where: { assignmentId, userId },
    select: { id: true },
  });
  if (existing) {
    res.status(409).json({ error: "Already submitted", existingId: existing.id });
    return;
  }

  const { repoUrl, deploymentUrl, screenshotUrl, sqlScriptUrl, reflection, selfScore, notes } = parsed.data;

  await db.$transaction([
    db.submission.create({
      data: {
        assignmentId, userId,
        repoUrl: repoUrl || null,
        deploymentUrl: deploymentUrl || null,
        screenshotUrl: screenshotUrl || null,
        sqlScriptUrl: sqlScriptUrl || null,
        reflection: reflection || null,
        selfScore: selfScore ?? null,
        notes: notes || null,
        status: "submitted",
        submittedAt: new Date(),
      },
    }),
    db.xpEvent.create({
      data: { userId, assignmentId, type: "assignment-submit", points: assignment.xpReward, reason: "Assignment submitted" },
    }),
  ]);

  res.json({ success: true });
});

// POST /api/progress/study-logs
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

router.post("/study-logs", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const parsed = StudyLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const { minutes, date, trackId, mood, energy, learned, blockers, nextStep } = parsed.data;
  const logDate = date ? new Date(date) : new Date();

  await db.$transaction([
    db.studyLog.create({ data: { userId, date: logDate, trackId, minutes, mood, energy, learned, blockers, nextStep } }),
    db.xpEvent.create({ data: { userId, trackId, type: "study-log", points: 10, reason: `Logged ${minutes} minutes of study` } }),
  ]);

  res.json({ success: true });
});

// POST /api/progress/weeks/:id/retro
const RetroSchema = z.object({ notes: z.string().max(5000).optional() });

router.post("/weeks/:id/retro", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const weekId = req.params.id;

  const parsed = RetroSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  await db.$transaction([
    db.weekSprint.update({
      where: { id: weekId },
      data: { retrospectiveCompleted: true, retrospectiveNotes: parsed.data.notes ?? null },
    }),
    db.xpEvent.create({
      data: { userId, weekId, type: "retro", points: 30, reason: "Week retrospective completed" },
    }),
  ]);

  res.json({ success: true });
});

export default router;
