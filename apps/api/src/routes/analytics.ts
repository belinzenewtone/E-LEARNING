import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";
import { startOfWeek, format, subWeeks, startOfDay } from "date-fns";

const router = Router();

router.use(authenticate);

// GET /api/analytics
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const [studyLogs, xpEvents, lessonProgress, tracks] = await Promise.all([
    db.studyLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, minutes: true, trackId: true },
    }),
    db.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, points: true, type: true },
    }),
    db.progress.findMany({
      where: { userId, status: "completed", lessonId: { not: null } },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true, trackId: true },
    }),
    db.track.findMany({
      select: {
        id: true, name: true, slug: true, color: true,
        modules: { select: { _count: { select: { lessons: true } } } },
      },
    }),
  ]);

  // Weekly hours (last 12 weeks)
  const weeklyHours = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 11 - i), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const mins = studyLogs
      .filter((l) => { const d = new Date(l.date); return d >= weekStart && d < weekEnd; })
      .reduce((sum, l) => sum + l.minutes, 0);
    return { week: format(weekStart, "MMM d"), hours: Math.round((mins / 60) * 10) / 10 };
  });

  // Cumulative XP
  let cumXp = 0;
  const xpOverTime = xpEvents.map((e) => {
    cumXp += e.points;
    return { date: format(new Date(e.createdAt), "MMM d"), xp: cumXp };
  });

  // Lessons over time
  let lessonCount = 0;
  const lessonsOverTime = lessonProgress.map((p) => {
    lessonCount++;
    return { date: p.completedAt ? format(new Date(p.completedAt), "MMM d") : "", count: lessonCount };
  });

  // Track progress
  const completedByTrack = await db.progress.groupBy({
    by: ["trackId"],
    where: { userId, status: "completed", lessonId: { not: null }, trackId: { not: null } },
    _count: { id: true },
  });
  const completedMap = new Map(completedByTrack.map((r) => [r.trackId!, r._count.id]));

  const trackProgress = tracks.map((track) => {
    const total = track.modules.reduce((sum, m) => sum + m._count.lessons, 0);
    const completed = completedMap.get(track.id) ?? 0;
    return {
      name: track.name, slug: track.slug, color: track.color,
      total, completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Activity heatmap (last 60 days)
  const activityDays = Array.from({ length: 60 }, (_, i) => {
    const day = startOfDay(new Date());
    day.setDate(day.getDate() - (59 - i));
    const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
    const minutes = studyLogs
      .filter((l) => { const d = new Date(l.date); return d >= day && d < nextDay; })
      .reduce((sum, l) => sum + l.minutes, 0);
    return { date: format(day, "yyyy-MM-dd"), active: minutes >= 30, minutes };
  });

  res.json({
    weeklyHours, xpOverTime, lessonsOverTime, trackProgress, activityDays,
    summary: {
      totalMinutes: studyLogs.reduce((sum, l) => sum + l.minutes, 0),
      totalXp: xpEvents.reduce((sum, e) => sum + e.points, 0),
      lessonsCompleted: lessonCount,
      activeDays: activityDays.filter((d) => d.active).length,
    },
  });
});

export default router;
