import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, subDays,
} from "date-fns";

const router = Router();

router.use(authenticate);

function calcStreak(logs: { date: Date; minutes: number }[]): number {
  let streak = 0;
  const check = startOfDay(new Date());

  for (let i = 0; i < 60; i++) {
    const dayStart = startOfDay(subDays(check, i));
    const dayEnd = endOfDay(dayStart);
    const hit = logs.find(
      (l) => new Date(l.date) >= dayStart && new Date(l.date) <= dayEnd && l.minutes >= 30
    );
    if (hit) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// GET /api/dashboard/stats
router.get("/stats", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const now = new Date();

  const [
    xpAggregate, studyLogs30d, webTrack, dataTrack,
    currentWeek, studyLogsThisWeek, lessonsCompletedTodayCount, overdueCount,
  ] = await Promise.all([
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
    db.studyLog.findMany({
      where: { userId, date: { gte: subDays(now, 60) } },
      select: { date: true, minutes: true },
    }),
    db.track.findUnique({
      where: { slug: "web" },
      select: { id: true, modules: { select: { lessons: { select: { id: true, status: true } } } } },
    }),
    db.track.findFirst({
      where: { slug: "data-engineering" },
      select: { id: true, modules: { select: { lessons: { select: { id: true, status: true } } } } },
    }),
    db.weekSprint.findFirst({ where: { status: "active" }, orderBy: { weekNumber: "asc" } }),
    db.studyLog.aggregate({
      where: {
        userId,
        date: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) },
      },
      _sum: { minutes: true },
    }),
    db.progress.count({
      where: {
        userId, lessonId: { not: null }, status: "completed",
        completedAt: { gte: startOfDay(now), lte: endOfDay(now) },
      },
    }),
    db.assignment.count({
      where: {
        dueDate: { lt: now },
        submissions: { none: { userId, status: { in: ["submitted", "approved", "reviewed"] } } },
      },
    }),
  ]);

  const totalXp = xpAggregate._sum.points ?? 0;
  const streak = calcStreak(studyLogs30d);

  const webLessons = webTrack?.modules.flatMap((m) => m.lessons) ?? [];
  const webCompleted = webLessons.filter((l) => l.status === "completed").length;
  const webProgress = webLessons.length > 0 ? Math.round((webCompleted / webLessons.length) * 100) : 0;

  const dataLessons = dataTrack?.modules.flatMap((m) => m.lessons) ?? [];
  const dataCompleted = dataLessons.filter((l) => l.status === "completed").length;
  const dataProgress = dataLessons.length > 0 ? Math.round((dataCompleted / dataLessons.length) * 100) : 0;

  const allLessons = webLessons.length + dataLessons.length;
  const allCompleted = webCompleted + dataCompleted;
  const overallProgress = allLessons > 0 ? Math.round((allCompleted / allLessons) * 100) : 0;

  const studyMinutesThisWeek = studyLogsThisWeek._sum.minutes ?? 0;

  let weeklyScore = 0;
  if (currentWeek) {
    const [weekLessons, weekAssignments, todayLog] = await Promise.all([
      db.lesson.findMany({ where: { weekId: currentWeek.id }, select: { id: true, status: true } }),
      db.assignment.findMany({
        where: { weekId: currentWeek.id },
        select: { id: true, submissions: { where: { userId }, select: { status: true } } },
      }),
      db.studyLog.findFirst({
        where: { userId, date: { gte: startOfDay(now), lte: endOfDay(now) } },
      }),
    ]);

    const lessonRate = weekLessons.length > 0
      ? weekLessons.filter((l) => l.status === "completed").length / weekLessons.length : 0;
    const assignmentRate = weekAssignments.length > 0
      ? weekAssignments.filter((a) => a.submissions.length > 0).length / weekAssignments.length : 0;

    weeklyScore = Math.round(
      lessonRate * 40 + assignmentRate * 40 + (todayLog ? 10 : 0) + (currentWeek.retrospectiveCompleted ? 10 : 0)
    );
  }

  res.json({
    totalXp, streak, webProgress, dataProgress, overallProgress,
    studyMinutesThisWeek, weeklyScore,
    currentWeek,
    lessonsCompletedToday: lessonsCompletedTodayCount,
    overdueAssignments: overdueCount,
  });
});

// GET /api/dashboard/today-tasks
router.get("/today-tasks", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const activeWeek = await db.weekSprint.findFirst({ where: { status: "active" }, select: { id: true } });
  if (!activeWeek) { res.json([]); return; }

  const tasks = await db.lesson.findMany({
    where: { weekId: activeWeek.id, status: { in: ["available", "in-progress"] } },
    orderBy: { order: "asc" },
    take: 5,
    include: {
      module: { select: { title: true, slug: true } },
      week: { select: { weekNumber: true, title: true } },
      progress: { where: { userId }, select: { status: true } },
    },
  });

  res.json(tasks);
});

// GET /api/dashboard/recent-activity
router.get("/recent-activity", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const activity = await db.xpEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, type: true, points: true, reason: true },
  });

  res.json(activity);
});

// GET /api/dashboard/due-reviews
router.get("/due-reviews", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const answers = await db.lessonCheckpointAnswer.findMany({
    where: { userId, nextReview: { lte: new Date() } },
    select: { lessonId: true, lesson: { select: { title: true, slug: true } } },
    distinct: ["lessonId"],
    take: 5,
  });

  res.json(answers.map((a) => ({ lessonId: a.lessonId, title: a.lesson.title, slug: a.lesson.slug })));
});

// GET /api/dashboard/week-assignments
router.get("/week-assignments", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const activeWeek = await db.weekSprint.findFirst({ where: { status: "active" }, select: { id: true } });
  if (!activeWeek) { res.json([]); return; }

  const assignments = await db.assignment.findMany({
    where: { weekId: activeWeek.id },
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
      submissions: {
        where: { userId },
        select: { id: true, status: true, submittedAt: true, selfScore: true },
      },
    },
  });

  res.json(assignments);
});

export default router;
