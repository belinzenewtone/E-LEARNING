import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { syncWeekStatuses } from "@/lib/week-activator";
import { generateNotifications, getNotifications, getUnreadCount } from "@/server/queries/notifications";

// Cache XP total per user — revalidates every 30 s.
// Tag 'user-xp-{userId}' is revalidated by server actions that award XP.
const getCachedUserXp = unstable_cache(
  (userId: string) =>
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
  ["layout-user-xp"],
  { revalidate: 30, tags: ["user-xp"] }
);

// Cache the 30-day study log used for streak — revalidates every 60 s.
const getCachedRecentLogs = unstable_cache(
  (userId: string) =>
    db.studyLog.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: "desc" },
      select: { date: true, minutes: true },
    }),
  ["layout-recent-logs"],
  { revalidate: 60, tags: ["study-logs"] }
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });

  if (!user) redirect("/login");

  // Sync week statuses — throttled to once/hour in week-activator.ts (near-zero cost)
  await syncWeekStatuses();

  // Fire-and-forget — don't block rendering for notification generation
  generateNotifications(user.id).catch((err) =>
    console.error("[layout] generateNotifications failed:", err)
  );

  const [xpAggregate, recentLogs] = await Promise.all([
    getCachedUserXp(user.id),
    getCachedRecentLogs(user.id),
  ]);

  // Calculate streak
  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayLog = recentLogs.find(
      (l) =>
        new Date(l.date) >= dayStart && new Date(l.date) < dayEnd && l.minutes >= 30
    );

    if (dayLog) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const userXp = xpAggregate._sum.points ?? 0;
  const userName = user.name ?? "Learner";

  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  let unreadCount = 0;
  try {
    [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id),
      getUnreadCount(user.id),
    ]);
  } catch (err) {
    console.error("[layout] getNotifications failed:", err);
  }

  return (
    <DashboardShell
      userXp={userXp}
      streak={streak}
      userName={userName}
      userId={user.id}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:flex lg:shrink-0">
          <Sidebar userXp={userXp} streak={streak} userName={userName} />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          {children}
          <ScrollToTop />
        </main>
      </div>
    </DashboardShell>
  );
}
