import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

// GET /api/search?q=<query>
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const q = String(req.query.q ?? "").trim();

  if (q.length < 2) { res.json({ lessons: [], assignments: [], notes: [] }); return; }

  const [lessons, assignments, notes] = await Promise.all([
    db.lesson.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, slug: true },
      take: 5,
    }),
    db.assignment.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, weekId: true },
      take: 5,
    }),
    db.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
      take: 5,
    }),
  ]);

  res.json({
    lessons: lessons.map((l) => ({ id: l.id, title: l.title, href: `/lessons/${l.slug}` })),
    assignments: assignments.map((a) => ({ id: a.id, title: a.title, href: `/assignments/${a.id}` })),
    notes: notes.map((n) => ({ id: n.id, title: n.title, href: `/notes/${n.id}` })),
  });
});

export default router;
