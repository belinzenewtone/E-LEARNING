import { db } from "@/lib/db";
import { startOfDay, subDays, endOfDay } from "date-fns";

// ── getNotifications ──────────────────────────────────────────────────────────

export async function getNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: [
      { read: "asc" },
      { createdAt: "desc" },
    ],
    take: 20,
  });
}

// ── getUnreadCount ────────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, read: false },
  });
}

// ── generateNotifications ─────────────────────────────────────────────────────

export async function generateNotifications(userId: string) {
  const now = new Date();
  const created: string[] = [];

  // ── 1. Overdue assignments ─────────────────────────────────────────────────
  const overdueAssignments = await db.assignment.findMany({
    where: {
      dueDate: { lt: now },
      submissions: {
        none: {
          userId,
          status: { in: ["submitted", "approved", "reviewed"] },
        },
      },
    },
    select: { id: true, title: true },
  });

  // Batch-check which assignments already have an unread notification
  if (overdueAssignments.length > 0) {
    const overdueHrefs = overdueAssignments.map((a) => `/assignments/${a.id}`);
    const existingNotifs = await db.notification.findMany({
      where: { userId, type: "overdue_assignment", read: false, href: { in: overdueHrefs } },
      select: { href: true },
    });
    const notifiedHrefs = new Set(existingNotifs.map((n) => n.href));

    const newData = overdueAssignments
      .filter((a) => !notifiedHrefs.has(`/assignments/${a.id}`))
      .map((a) => ({
        userId,
        type: "overdue_assignment",
        title: "Overdue Assignment",
        body: `"${a.title}" is past due and hasn't been submitted yet.`,
        href: `/assignments/${a.id}`,
        read: false,
      }));

    if (newData.length > 0) {
      await db.notification.createMany({ data: newData });
      created.push(...newData.map((d) => d.href));
    }
  }

  // ── 2. Streak at risk ──────────────────────────────────────────────────────
  // Conditions: last log was yesterday (streak > 0), no log today yet
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));

  const [todayLog, yesterdayLog] = await Promise.all([
    db.studyLog.findFirst({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
    }),
    db.studyLog.findFirst({
      where: { userId, date: { gte: yesterdayStart, lte: yesterdayEnd } },
    }),
  ]);

  if (!todayLog && yesterdayLog) {
    // Confirm they have a streak (at least studied yesterday)
    const existingStreakRisk = await db.notification.findFirst({
      where: {
        userId,
        type: "streak_risk",
        read: false,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    if (!existingStreakRisk) {
      const notification = await db.notification.create({
        data: {
          userId,
          type: "streak_risk",
          title: "Streak at Risk!",
          body: "You studied yesterday but haven't logged any study time today. Log a session to keep your streak alive.",
          href: "/study-log",
          read: false,
        },
      });
      created.push(notification.id);
    }
  }

  return { created };
}
