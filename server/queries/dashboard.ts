import { db } from "@/lib/db";
import { calculateStreak, calculateWeeklyScore } from "@/lib/progress";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from "date-fns";

// Inline type matching the WeekSprint shape from Prisma schema
type WeekSprint = {
  id: string;
  weekNumber: number;
  title: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  status: string;
  estimatedHours: number;
  retrospectiveCompleted: boolean;
  retrospectiveNotes: string | null;
  phase: number;
  createdAt: Date;
  updatedAt: Date;
};

// ── getDashboardStats ─────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string) {
  const now = new Date();

  const [
    xpAggregate,
    studyLogs60d,
    webTrack,
    dataTrack,
    pythonTrack,
    completedProgress,
    currentWeek,
    studyLogsThisWeek,
    lessonsCompletedTodayCount,
    overdueCount,
  ] = await Promise.all([
    // total XP
    db.xpEvent.aggregate({
      where: { userId },
      _sum: { points: true },
    }),

    // last 60 days of logs for streak
    db.studyLog.findMany({
      where: {
        userId,
        date: { gte: subDays(now, 60) },
      },
      select: { date: true, minutes: true },
    }),

    // web track — lesson IDs only (totals)
    db.track.findUnique({
      where: { slug: "web" },
      select: {
        id: true,
        modules: { select: { lessons: { select: { id: true } } } },
      },
    }),

    // data track — lesson IDs only (totals)
    db.track.findFirst({
      where: { slug: "data-engineering" },
      select: {
        id: true,
        modules: { select: { lessons: { select: { id: true } } } },
      },
    }),

    // python & fastapi track — lesson IDs only (totals)
    db.track.findFirst({
      where: { slug: "python-fastapi" },
      select: {
        id: true,
        modules: { select: { lessons: { select: { id: true } } } },
      },
    }),

    // user's completed lessons from Progress table (source of truth)
    db.progress.findMany({
      where: { userId, status: "completed", lessonId: { not: null } },
      select: { lessonId: true },
    }),

    // current active week sprint
    db.weekSprint.findFirst({
      where: { status: "active" },
      orderBy: { weekNumber: "asc" },
    }),

    // study minutes this week
    db.studyLog.aggregate({
      where: {
        userId,
        date: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
      _sum: { minutes: true },
    }),

    // lessons completed today (from Progress, not Lesson.status)
    db.progress.count({
      where: {
        userId,
        lessonId: { not: null },
        status: "completed",
        completedAt: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
      },
    }),

    // overdue assignments (past dueDate, no submitted/completed submission)
    db.assignment.count({
      where: {
        dueDate: { lt: now },
        submissions: {
          none: {
            userId,
            status: { in: ["submitted", "approved", "reviewed"] },
          },
        },
      },
    }),
  ]);

  const totalXp = xpAggregate._sum.points ?? 0;
  const streak = calculateStreak(studyLogs60d);

  // Use Progress table (per-user) for all completion counts
  const completedLessonIds = new Set(completedProgress.map((p) => p.lessonId));

  const webLessonIds = webTrack?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
  const webCompleted = webLessonIds.filter((id) => completedLessonIds.has(id)).length;
  const webProgress = webLessonIds.length > 0
    ? Math.round((webCompleted / webLessonIds.length) * 100) : 0;

  const dataLessonIds = dataTrack?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
  const dataCompleted = dataLessonIds.filter((id) => completedLessonIds.has(id)).length;
  const dataProgress = dataLessonIds.length > 0
    ? Math.round((dataCompleted / dataLessonIds.length) * 100) : 0;

  const pythonLessonIds = pythonTrack?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
  const pythonCompleted = pythonLessonIds.filter((id) => completedLessonIds.has(id)).length;
  const pythonProgress = pythonLessonIds.length > 0
    ? Math.round((pythonCompleted / pythonLessonIds.length) * 100) : 0;

  const allLessons = webLessonIds.length + dataLessonIds.length + pythonLessonIds.length;
  const allCompleted = webCompleted + dataCompleted + pythonCompleted;
  const overallProgress = allLessons > 0 ? Math.round((allCompleted / allLessons) * 100) : 0;

  const studyMinutesThisWeek = studyLogsThisWeek._sum.minutes ?? 0;

  // weekly score calculation (only if there is an active week)
  let weeklyScore = 0;
  if (currentWeek) {
    const [weekLessonsTotal, weekLessonsCompleted, weekAssignments, todayLog] = await Promise.all([
      db.lesson.count({ where: { weekId: currentWeek.id } }),
      // Count from Progress table — accurate per-user completion
      db.progress.count({
        where: { userId, status: "completed", lesson: { weekId: currentWeek.id } },
      }),
      db.assignment.findMany({
        where: { weekId: currentWeek.id },
        select: {
          id: true,
          submissions: { where: { userId }, select: { status: true } },
        },
      }),
      db.studyLog.findFirst({
        where: { userId, date: { gte: startOfDay(now), lte: endOfDay(now) } },
      }),
    ]);

    weeklyScore = calculateWeeklyScore({
      lessonsTotal: weekLessonsTotal,
      lessonsCompleted: weekLessonsCompleted,
      assignmentsTotal: weekAssignments.length,
      assignmentsSubmitted: weekAssignments.filter((a) => a.submissions.length > 0).length,
      studiedToday: !!todayLog,
      retroCompleted: currentWeek.retrospectiveCompleted,
    });
  }

  return {
    totalXp,
    streak,
    webProgress,
    dataProgress,
    pythonProgress,
    overallProgress,
    studyMinutesThisWeek,
    weeklyScore,
    currentWeek: currentWeek as WeekSprint | null,
    lessonsCompletedToday: lessonsCompletedTodayCount,
    overdueAssignments: overdueCount,
  };
}

// ── getTodaysTasks ────────────────────────────────────────────────────────────

export async function getTodaysTasks(userId: string) {
  // find the active week first
  const activeWeek = await db.weekSprint.findFirst({
    where: { status: "active" },
    select: { id: true },
  });

  if (!activeWeek) return [];

  return db.lesson.findMany({
    where: {
      weekId: activeWeek.id,
      status: { in: ["available", "in-progress"] },
    },
    orderBy: { order: "asc" },
    take: 5,
    include: {
      module: { select: { title: true, slug: true } },
      week: { select: { weekNumber: true, title: true } },
      progress: {
        where: { userId },
        select: { status: true },
      },
    },
  });
}

// ── getRecentActivity ─────────────────────────────────────────────────────────

export async function getRecentActivity(userId: string) {
  return db.xpEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      type: true,
      points: true,
      reason: true,
    },
  });
}

// ── getCurrentWeekAssignments ─────────────────────────────────────────────────

export async function getDueReviews(userId: string) {
  const now = new Date();
  const answers = await db.lessonCheckpointAnswer.findMany({
    where: {
      userId,
      nextReview: { lte: now },
    },
    select: {
      lessonId: true,
      lesson: { select: { title: true, slug: true } },
    },
    distinct: ["lessonId"],
    take: 5,
  });
  return answers.map((a) => ({ lessonId: a.lessonId, title: a.lesson.title, slug: a.lesson.slug }));
}

export async function getCurrentWeekAssignments(userId: string) {
  const activeWeek = await db.weekSprint.findFirst({
    where: { status: "active" },
    select: { id: true },
  });

  if (!activeWeek) return [];

  return db.assignment.findMany({
    where: { weekId: activeWeek.id },
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
      submissions: {
        where: { userId },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          selfScore: true,
        },
      },
    },
  });
}
