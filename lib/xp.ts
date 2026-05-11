import { XP_VALUES, type XpEventType } from "@/types";
import { db } from "@/lib/db";

export async function awardXp(
  userId: string,
  type: XpEventType,
  reason: string,
  refs?: {
    lessonId?: string;
    assignmentId?: string;
    weekId?: string;
    trackId?: string;
  }
) {
  const points = XP_VALUES[type];
  return db.xpEvent.create({
    data: {
      userId,
      type,
      points,
      reason,
      ...refs,
    },
  });
}

export async function getTotalXp(userId: string): Promise<number> {
  const result = await db.xpEvent.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

export async function getStreakDays(userId: string): Promise<number> {
  const logs = await db.studyLog.findMany({
    where: { userId, date: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
    orderBy: { date: "desc" },
    select: { date: true, minutes: true },
  });

  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayLog = logs.find((l) => {
      const d = new Date(l.date);
      return d >= dayStart && d < dayEnd && l.minutes >= 30;
    });

    if (dayLog) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Allow today to not yet be logged without breaking streak
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
