import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startOfWeek, endOfWeek } from "date-fns";
import { Topbar } from "@/components/layout/topbar";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings | Personal Learning OS",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [user, goals, xpAgg, studyLogs, tracks, weekLogs] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    db.goal.findMany({
      where: { userId },
      include: { track: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
    db.studyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
      include: { track: { select: { name: true, slug: true } } },
    }),
    db.track.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.studyLog.findMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
      select: { date: true, minutes: true },
    }),
  ]);

  const totalMinutes = studyLogs.reduce((s, l) => s + l.minutes, 0);
  const weekMinutes = weekLogs.reduce((s, l) => s + l.minutes, 0);
  const uniqueWeekDays = new Set(weekLogs.map((l) => new Date(l.date).toDateString())).size;

  return (
    <div>
      <Topbar title="Settings" subtitle="Profile and preferences" />
      <SettingsClient
        user={user}
        goals={goals}
        xpTotal={xpAgg._sum.points ?? 0}
        studyLogs={studyLogs}
        tracks={tracks}
        weekStats={{ totalMinutes, weekMinutes, uniqueWeekDays }}
      />
    </div>
  );
}
