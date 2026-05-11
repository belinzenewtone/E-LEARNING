import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { syncWeekStatuses } from "@/lib/week-activator";
import { generateNotifications, getNotifications, getUnreadCount } from "@/server/queries/notifications";

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

  // Auto-activate/complete weeks based on today's date (lightweight — only runs if status changes)
  await syncWeekStatuses();

  // Generate new notifications — wrapped so a missing table never crashes the layout
  try { await generateNotifications(user.id); } catch { /* table may not exist yet */ }

  const [xpAggregate, recentLogs] = await Promise.all([
    db.xpEvent.aggregate({
      where: { userId: user.id },
      _sum: { points: true },
    }),
    db.studyLog.findMany({
      where: {
        userId: user.id,
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: "desc" },
      select: { date: true, minutes: true },
    }),
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
  } catch { /* notification table not yet migrated — bell shows empty */ }

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
        </main>
      </div>
    </DashboardShell>
  );
}
