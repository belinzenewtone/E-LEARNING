import { db } from "@/lib/db";
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

// ── helpers ──────────────────────────────────────────────────────────────────

function calcStreak(logs: { date: Date; minutes: number }[]): number {
  let streak = 0;
  const check = startOfDay(new Date());

  for (let i = 0; i < 60; i++) {
    const dayStart = startOfDay(subDays(check, i));
    const dayEnd = endOfDay(dayStart);

    const hit = logs.find(
      (l) =>
        new Date(l.date) >= dayStart &&
        new Date(l.date) <= dayEnd &&
        l.minutes >= 30
    );

    if (hit) {
      streak++;
    } else if (i === 0) {
      // today not yet logged — don't break the streak
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// ── getDashboardStats ─────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string) {
  const now = new Date();

  const [
    xpAggregate,
    studyLogs30d,
    webTrack,
    dataTrack,
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

    // web track with lessons (via modules)
    db.track.findUnique({
      where: { slug: "web" },
      select: {
        id: true,
        modules: {
          select: {
            lessons: { select: { id: true, status: true } },
          },
        },
      },
    }),

    // data track with lessons (via modules)
    db.track.findFirst({
      where: { slug: "data-engineering" },
      select: {
        id: true,
        modules: {
          select: {
            lessons: { select: { id: true, status: true } },
          },
        },
      },
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

    // lessons completed today
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
  const streak = calcStreak(studyLogs30d);

  const webLessons: { id: string; status: string }[] =
    webTrack?.modules.flatMap((m) => m.lessons) ?? [];
  const webCompleted = webLessons.filter((l) => l.status === "completed").length;
  const webProgress =
    webLessons.length > 0
      ? Math.round((webCompleted / webLessons.length) * 100)
      : 0;

  const dataLessons: { id: string; status: string }[] =
    dataTrack?.modules.flatMap((m) => m.lessons) ?? [];
  const dataCompleted = dataLessons.filter((l) => l.status === "completed").length;
  const dataProgress =
    dataLessons.length > 0
      ? Math.round((dataCompleted / dataLessons.length) * 100)
      : 0;

  const allLessons = webLessons.length + dataLessons.length;
  const allCompleted = webCompleted + dataCompleted;
  const overallProgress =
    allLessons > 0 ? Math.round((allCompleted / allLessons) * 100) : 0;

  const studyMinutesThisWeek = studyLogsThisWeek._sum.minutes ?? 0;

  // weekly score calculation (only if there is an active week)
  let weeklyScore = 0;
  if (currentWeek) {
    const [weekLessons, weekAssignments, todayLog] = await Promise.all([
      db.lesson.findMany({
        where: { weekId: currentWeek.id },
        select: { id: true, status: true },
      }),
      db.assignment.findMany({
        where: { weekId: currentWeek.id },
        select: {
          id: true,
          submissions: {
            where: { userId },
            select: { status: true },
          },
        },
      }),
      db.studyLog.findFirst({
        where: {
          userId,
          date: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
      }),
    ]);

    const lessonsTotal = weekLessons.length;
    const lessonsCompleted = weekLessons.filter(
      (l: { id: string; status: string }) => l.status === "completed"
    ).length;
    const assignmentsTotal = weekAssignments.length;
    const assignmentsSubmitted = weekAssignments.filter(
      (a: { id: string; submissions: { status: string }[] }) =>
        a.submissions.length > 0
    ).length;
    const studiedToday = !!todayLog;
    const retroCompleted = currentWeek.retrospectiveCompleted;

    const lessonRate =
      lessonsTotal > 0 ? lessonsCompleted / lessonsTotal : 0;
    const assignmentRate =
      assignmentsTotal > 0 ? assignmentsSubmitted / assignmentsTotal : 0;

    weeklyScore = Math.round(
      lessonRate * 40 +
        assignmentRate * 40 +
        (studiedToday ? 10 : 0) +
        (retroCompleted ? 10 : 0)
    );
  }

  return {
    totalXp,
    streak,
    webProgress,
    dataProgress,
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
