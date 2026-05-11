import { db } from "@/lib/db";
import { startOfWeek, format, subWeeks } from "date-fns";

export type AnalyticsData = {
  weeklyHours: { week: string; hours: number }[];
  xpOverTime: { date: string; xp: number }[];
  lessonsOverTime: { date: string; count: number }[];
  trackProgress: { name: string; slug: string; color: string; total: number; completed: number; percent: number }[];
  activityDays: { date: string; active: boolean; minutes: number }[];
  summary: { totalMinutes: number; totalXp: number; lessonsCompleted: number; activeDays: number };
};

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
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

  // Weekly study hours (last 12 weeks)
  const weeklyHours: { week: string; hours: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekLabel = format(weekStart, "MMM d");
    const weekLogs = studyLogs.filter((l) => {
      const d = new Date(l.date);
      return d >= weekStart && d < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    });
    const totalMinutes = weekLogs.reduce((sum, l) => sum + l.minutes, 0);
    weeklyHours.push({ week: weekLabel, hours: Math.round((totalMinutes / 60) * 10) / 10 });
  }

  // Cumulative XP over time
  let cumulativeXp = 0;
  const xpOverTime = xpEvents.map((e) => {
    cumulativeXp += e.points;
    return { date: format(new Date(e.createdAt), "MMM d"), xp: cumulativeXp };
  });

  // Lessons completed over time
  let lessonCount = 0;
  const lessonsOverTime = lessonProgress.map((p) => {
    lessonCount++;
    return { date: p.completedAt ? format(new Date(p.completedAt), "MMM d") : "", count: lessonCount };
  });

  // Track progress
  const trackProgress = await Promise.all(
    tracks.map(async (track) => {
      const totalLessons = track.modules.reduce((sum, m) => sum + m._count.lessons, 0);
      const completedLessons = await db.progress.count({
        where: { userId, trackId: track.id, status: "completed", lessonId: { not: null } },
      });
      return {
        name: track.name, slug: track.slug, color: track.color,
        total: totalLessons, completed: completedLessons,
        percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    })
  );

  // Activity heatmap (last 60 days)
  const activityDays: { date: string; active: boolean; minutes: number }[] = [];
  for (let i = 59; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayLogs = studyLogs.filter((l) => { const d = new Date(l.date); return d >= day && d < nextDay; });
    const minutes = dayLogs.reduce((sum, l) => sum + l.minutes, 0);
    activityDays.push({ date: format(day, "yyyy-MM-dd"), active: minutes >= 30, minutes });
  }

  return {
    weeklyHours,
    xpOverTime,
    lessonsOverTime,
    trackProgress,
    activityDays,
    summary: {
      totalMinutes: studyLogs.reduce((sum, l) => sum + l.minutes, 0),
      totalXp: xpEvents.reduce((sum, e) => sum + e.points, 0),
      lessonsCompleted: lessonCount,
      activeDays: activityDays.filter((d) => d.active).length,
    },
  };
}
