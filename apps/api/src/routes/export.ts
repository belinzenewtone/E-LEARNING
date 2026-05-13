import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";
import { format } from "date-fns";

const router = Router();

router.use(authenticate);

// GET /api/export/notes
router.get("/notes", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const notes = await db.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      lesson: { select: { title: true, slug: true } },
      week: { select: { weekNumber: true, title: true } },
    },
  });

  const lines = ["# My Learning Notes", `Exported: ${format(new Date(), "yyyy-MM-dd")}`, ""];

  for (const note of notes) {
    lines.push(`## ${note.title}`);
    if (note.lesson) lines.push(`**Lesson:** ${note.lesson.title}`);
    if (note.week) lines.push(`**Week ${note.week.weekNumber}:** ${note.week.title}`);
    if (note.tags.length > 0) lines.push(`**Tags:** ${note.tags.join(", ")}`);
    lines.push(`*Created: ${format(new Date(note.createdAt), "yyyy-MM-dd")}*`, "");
    lines.push(note.content, "", "---", "");
  }

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="learning-notes-${format(new Date(), "yyyy-MM-dd")}.md"`);
  res.send(lines.join("\n"));
});

// GET /api/export/study-log
router.get("/study-log", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const logs = await db.studyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { track: { select: { name: true } } },
  });

  const headers = ["Date", "Minutes", "Track", "Mood", "Energy", "Learned", "Blockers", "Next Step"];
  const rows = logs.map((l) => [
    format(new Date(l.date), "yyyy-MM-dd"),
    String(l.minutes),
    l.track?.name ?? "",
    l.mood ?? "",
    l.energy ? String(l.energy) : "",
    (l.learned ?? "").replace(/,/g, ";"),
    (l.blockers ?? "").replace(/,/g, ";"),
    (l.nextStep ?? "").replace(/,/g, ";"),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="study-log-${format(new Date(), "yyyy-MM-dd")}.csv"`);
  res.send(csv);
});

export default router;
