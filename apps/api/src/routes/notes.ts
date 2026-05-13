import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

const NoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  lessonId: z.string().optional(),
  assignmentId: z.string().optional(),
  weekId: z.string().optional(),
  trackId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  reviewLater: z.boolean().optional(),
});

// GET /api/notes
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { lessonId, assignmentId, weekId, pinned } = req.query;

  const notes = await db.note.findMany({
    where: {
      userId,
      ...(lessonId ? { lessonId: String(lessonId) } : {}),
      ...(assignmentId ? { assignmentId: String(assignmentId) } : {}),
      ...(weekId ? { weekId: String(weekId) } : {}),
      ...(pinned === "true" ? { pinned: true } : {}),
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  res.json(notes);
});

// GET /api/notes/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const note = await db.note.findFirst({ where: { id: req.params.id, userId } });
  if (!note) { res.status(404).json({ error: "Note not found" }); return; }
  res.json(note);
});

// POST /api/notes
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const parsed = NoteSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const { title, content, lessonId, assignmentId, weekId, trackId, tags, pinned, reviewLater } = parsed.data;

  await db.$transaction([
    db.note.create({
      data: {
        userId, title, content, lessonId, assignmentId, weekId, trackId,
        tags: tags ?? [],
        pinned: pinned ?? false,
        reviewLater: reviewLater ?? false,
      },
    }),
    db.xpEvent.create({
      data: { userId, lessonId, weekId, trackId, type: "note-added", points: 5, reason: "Note added" },
    }),
  ]);

  res.status(201).json({ success: true });
});

// PATCH /api/notes/:id
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const existing = await db.note.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) { res.status(404).json({ error: "Note not found" }); return; }

  const parsed = NoteSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

  const updated = await db.note.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(updated);
});

// DELETE /api/notes/:id
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const existing = await db.note.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) { res.status(404).json({ error: "Note not found" }); return; }

  await db.note.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
