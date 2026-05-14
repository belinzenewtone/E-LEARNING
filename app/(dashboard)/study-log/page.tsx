import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Clock, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { getMoodEmoji, minutesToHours, formatDate, truncate } from "@/lib/utils";
import { startOfWeek, endOfWeek } from "date-fns";
import { StudyLogForm } from "./study-log-form";
import { Topbar } from "@/components/layout/topbar";

// ── page ──────────────────────────────────────────────────────────────────────

export default async function StudyLogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [allLogs, tracks, weekLogsAgg] = await Promise.all([
    db.studyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: { track: { select: { name: true, slug: true } } },
    }),
    db.track.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.studyLog.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { date: true, minutes: true },
    }),
  ]);

  const totalMinutesEver = allLogs.reduce((s, l) => s + l.minutes, 0);
  const weekMinutes = weekLogsAgg.reduce((s, l) => s + l.minutes, 0);
  const uniqueWeekDays = new Set(
    weekLogsAgg.map((l) => new Date(l.date).toDateString())
  ).size;

  return (
    <div>
      <Topbar title="Study Log" subtitle="Track your daily study sessions" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Study Log</h1>
          <p className="text-sm text-muted-foreground">
            Track your daily study sessions and build consistency.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/export/study-log" download>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Hours Studied"
          value={minutesToHours(totalMinutesEver)}
          subtitle="All time"
          icon={Clock}
          color="primary"
        />
        <StatCard
          title="This Week"
          value={minutesToHours(weekMinutes)}
          subtitle="Minutes logged"
          icon={Clock}
          color="success"
        />
        <StatCard
          title="Days This Week"
          value={`${uniqueWeekDays}/7`}
          subtitle="Study days logged"
          icon={BookOpen}
          color="warning"
        />
      </div>

      {/* Two-column layout: form + this week summary */}
      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        {/* Log form (always at top) */}
        <StudyLogForm tracks={tracks} />

        {/* This week summary */}
        <Card className="border-border bg-card self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Minutes logged</span>
              <span className="text-sm font-semibold text-foreground">
                {weekMinutes}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Study days</span>
              <span className="text-sm font-semibold text-foreground">
                {uniqueWeekDays}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Average/day</span>
              <span className="text-sm font-semibold text-foreground">
                {uniqueWeekDays > 0
                  ? minutesToHours(Math.round(weekMinutes / uniqueWeekDays))
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Study History ({allLogs.length} entries)
        </h2>

        {allLogs.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No study sessions logged"
            description="Log your first session above to start tracking your progress."
          />
        ) : (
          <div className="space-y-2">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-3"
              >
                {/* Mood */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-lg">
                  {log.mood ? getMoodEmoji(log.mood) : "📚"}
                </div>

                {/* Main info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatDate(log.date)}
                    </span>
                    {log.track && (
                      <>
                        <span>·</span>
                        <span>{log.track.name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="font-semibold text-foreground">
                      {minutesToHours(log.minutes)}
                    </span>
                    {log.energy && (
                      <>
                        <span>·</span>
                        <span>Energy: {log.energy}/5</span>
                      </>
                    )}
                  </div>
                  {log.learned && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {truncate(log.learned, 200)}
                    </p>
                  )}
                  {log.blockers && (
                    <p className="mt-0.5 text-xs text-[var(--token-red)]/70 line-clamp-1">
                      Blocker: {log.blockers}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
