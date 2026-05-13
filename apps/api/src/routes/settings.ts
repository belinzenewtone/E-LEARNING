import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

// PUT /api/settings/profile
router.put("/profile", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const schema = z.object({
    name: z.string().min(1).max(100),
    avatarUrl: z.string().max(500).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  await db.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, ...(parsed.data.avatarUrl ? { avatarUrl: parsed.data.avatarUrl } : {}) },
  });

  res.json({ success: true });
});

// PUT /api/settings/password
router.put("/password", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  res.json({ success: true });
});

// DELETE /api/settings/progress
router.delete("/progress", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  await db.$transaction([
    db.xpEvent.deleteMany({ where: { userId } }),
    db.studyLog.deleteMany({ where: { userId } }),
    db.progress.deleteMany({ where: { userId } }),
    db.submission.deleteMany({ where: { userId } }),
    db.lessonCheckpointAnswer.deleteMany({ where: { userId } }),
    db.note.deleteMany({ where: { userId } }),
    db.goal.deleteMany({ where: { userId } }),
    db.weekSprint.updateMany({
      where: {},
      data: { retrospectiveCompleted: false, retrospectiveNotes: null, status: "locked" },
    }),
    db.lesson.updateMany({ where: {}, data: { status: "locked" } }),
  ]);

  res.json({ success: true });
});

export default router;
