import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  Zap, Flame, TrendingUp, Clock, BookOpen, AlertCircle, Calendar,
  CheckCircle2, PlayCircle, FileText, PenLine, Map, NotebookPen,
  ArrowRight, ChevronRight, Target,
} from "lucide-react";
import {
  getDashboardStats, getTodaysTasks, getRecentActivity, getCurrentWeekAssignments, getDueReviews,
} from "@/server/queries/dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn, minutesToHours, timeAgo, getStatusColor, getDifficultyColor, formatDate } from "@/lib/utils";

type TodaysTask = {
  id: string; title: string; slug: string; status: string; estimatedMinutes: number;
  sourceType: string; module: { title: string; slug: string }; week: { weekNumber: number; title: string };
  progress: { status: string }[];
};

type WeekAssignment = {
  id: string; title: string; difficulty: string;
  submissions: { id: string; status: string; submittedAt: Date; selfScore: number | null }[];
};

type ActivityEvent = { id: string; createdAt: Date; type: string; points: number; reason: string };

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function eventLabel(type: string): string {
  const labels: Record<string, string> = {
    "lesson-complete": "Completed a lesson",
    "assignment-submit": "Submitted an assignment",
    "retro": "Finished weekly retrospective",
    "study-log": "Logged a study session",
    "note-added": "Added a note",
    "checkpoint": "Answered a checkpoint",
  };
  return labels[type] ?? type;
}

function eventIcon(type: string) {
  switch (type) {
    case "lesson-complete": return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--token-emerald)]" />;
    case "assignment-submit": return <FileText className="h-3.5 w-3.5 text-[var(--token-cyan)]" />;
    case "retro": return <PenLine className="h-3.5 w-3.5 text-[var(--token-purple)]" />;
    case "study-log": return <Clock className="h-3.5 w-3.5 text-[var(--token-amber)]" />;
    case "note-added": return <PenLine className="h-3.5 w-3.5 text-[var(--token-blue)]" />;
    default: return <Zap className="h-3.5 w-3.5 text-primary" />
  }
}

async function DashboardContent({ userId, userName }: { userId: string; userName: string }) {
  const [stats, todaysTasks, recentActivity, weekAssignments] = await Promise.all([
    getDashboardStats(userId),
    getTodaysTasks(userId),
    getRecentActivity(userId),
    getCurrentWeekAssignments(userId),
  ]);

  // getDueReviews requires the nextReview column — guard until prisma db push is run
  let dueReviews: Awaited<ReturnType<typeof getDueReviews>> = [];
  try { dueReviews = await getDueReviews(userId); } catch { /* schema not yet migrated */ }

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const todayLabel = format(now, "EEEE, MMMM d, yyyy");
  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{todayLabel}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, {firstName}
        </h1>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {stats.currentWeek && (
            <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs">
              <Target className="h-3 w-3 text-primary" />
              <span className="font-medium text-foreground">
                Week {stats.currentWeek.weekNumber}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground">
            Lv {Math.floor(stats.totalXp / 500) + 1}
          </div>
        </div>
      </div>

      {/* Mini progress row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall</span><span className="font-medium text-foreground">{stats.overallProgress}%</span>
            </div>
            <Progress value={stats.overallProgress} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Web Track</span><span className="font-medium text-foreground">{stats.webProgress}%</span>
            </div>
            <Progress value={stats.webProgress} className="h-1.5 [&>div]:bg-[var(--token-cyan)]" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Data Track</span><span className="font-medium text-foreground">{stats.dataProgress}%</span>
            </div>
            <Progress value={stats.dataProgress} className="h-1.5 [&>div]:bg-[var(--token-emerald)]" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Python Track</span><span className="font-medium text-foreground">{stats.pythonProgress}%</span>
            </div>
            <Progress value={stats.pythonProgress} className="h-1.5 [&>div]:bg-[var(--token-amber)]" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Weekly Score</span><span className="font-medium text-foreground">{stats.weeklyScore}%</span>
            </div>
            <Progress value={stats.weeklyScore} className="h-1.5 [&>div]:bg-[var(--token-purple)]" />
          </div>
        </div>

      {/* ── Stat cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard title="Total XP" value={stats.totalXp.toLocaleString()} subtitle="Experience points" icon={Zap} color="primary" />
        <StatCard title="Streak" value={`${stats.streak}d`} subtitle={stats.streak > 0 ? "Keep it up!" : "Start today"} icon={Flame} color="warning" />
        <StatCard title="Study Time" value={`${(stats.studyMinutesThisWeek / 60).toFixed(1)}h`} subtitle="This week" icon={Clock} color="success" />
        <StatCard title="Overdue" value={stats.overdueAssignments} subtitle={stats.overdueAssignments === 0 ? "All clear!" : "Assignments"} icon={AlertCircle} color={stats.overdueAssignments > 0 ? "danger" : "success"} />
      </div>

      {/* ── Due for review ───────────────────────────────────────────────────── */}
      {dueReviews.length > 0 && (
        <Card className="border-[var(--token-amber)]/20 bg-[var(--token-amber)]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-[var(--token-amber)]">
              <BookOpen className="h-4 w-4" />
              Spaced Repetition — Due for Review ({dueReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {dueReviews.map((r) => (
                <li key={r.lessonId}>
                  <Button variant="outline" size="sm" asChild className="border-[var(--token-amber)]/20 text-[var(--token-amber)] hover:bg-[var(--token-amber)]/10">
                    <Link href={`/lessons/${r.slug}`}>{r.title}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Today&apos;s Learning Plan ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Today&apos;s Learning Plan</h2>
          {stats.lessonsCompletedToday > 0 && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {stats.lessonsCompletedToday} done
            </Badge>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardContent className="p-4">
            {todaysTasks.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="All caught up!"
                description="No pending lessons right now. Check the roadmap for what's next."
                action={{ label: "View Roadmap", href: "/roadmap" }}
              />
            ) : (
              <ul className="space-y-2">
                {(todaysTasks as TodaysTask[]).map((lesson) => {
                  const isDone = lesson.progress[0]?.status === "completed";
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/lessons/${lesson.slug}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm",
                          isDone ? "border-[var(--token-emerald)]/20 bg-[var(--token-emerald)]/5" : "border-border bg-muted/10 hover:bg-muted/20 hover:border-primary/30"
                        )}
                      >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", isDone ? "bg-[var(--token-emerald)]/10" : "bg-primary/10")}>
                          {isDone ? <CheckCircle2 className="h-4 w-4 text-[var(--token-emerald)]" /> : <PlayCircle className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-sm font-medium", isDone && "line-through text-muted-foreground")}>
                            {lesson.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{lesson.module.title}</span>
                            <span>·</span>
                            <span>{minutesToHours(lesson.estimatedMinutes)}</span>
                            {lesson.sourceType && <><span>·</span><span className="capitalize">{lesson.sourceType}</span></>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={cn("hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block capitalize", getStatusColor(lesson.progress[0]?.status ?? lesson.status))}>
                            {lesson.progress[0]?.status ?? lesson.status}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
            {stats.currentWeek ? (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Week {stats.currentWeek.weekNumber}
                  </p>
                  <p className="mt-0.5 font-semibold text-foreground leading-snug">{stats.currentWeek.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground italic">{stats.currentWeek.theme}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Due {formatDate(stats.currentWeek.endDate)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Weekly score</span>
                    <span className={cn("font-semibold", stats.weeklyScore >= 80 ? "text-[var(--token-emerald)]" : stats.weeklyScore >= 50 ? "text-[var(--token-amber)]" : "text-foreground")}>
                      {stats.weeklyScore}%
                    </span>
                  </div>
                  <Progress value={stats.weeklyScore} className="h-2" />
                </div>
                {stats.overdueAssignments > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-[var(--token-red)]/20 bg-[var(--token-red)]/5 px-3 py-2 text-xs text-[var(--token-red)]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {stats.overdueAssignments} overdue
                  </div>
                )}
                {weekAssignments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Assignments</p>
                    {(weekAssignments as WeekAssignment[]).slice(0, 3).map((a) => {
                      const done = a.submissions.length > 0;
                      return (
                        <Link key={a.id} href={`/assignments/${a.id}`} className="flex items-center gap-2 group">
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", done ? "bg-[var(--token-emerald)]" : "bg-muted-foreground/30")} />
                          <span className={cn("flex-1 truncate text-xs transition-colors group-hover:text-primary", done ? "text-muted-foreground line-through" : "text-foreground")}>
                            {a.title}
                          </span>
                          {done && <Badge variant="success" className="text-[10px] px-1.5 py-0">done</Badge>}
                        </Link>
                      );
                    })}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
                  <Link href={`/weeks/${stats.currentWeek.weekNumber}`}>
                    View Sprint <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            ) : (
              <EmptyState icon={Target} title="No active sprint" description="Week sprints activate automatically based on the schedule." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* ── Track Progress ─────────────────────────────────────────────────────── */}
    <div>
      <h2 className="text-sm font-medium text-foreground mb-3">Track Progress</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={stats.webProgress} size={72} color="var(--token-cyan)" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Web Development</p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">{stats.webProgress}%</p>
                <p className="text-xs text-muted-foreground">JavaScript · TypeScript · Next.js</p>
                <Progress value={stats.webProgress} className="mt-2 h-1.5 [&>div]:bg-[var(--token-cyan)]" />
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" asChild>
                <Link href="/roadmap"><ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={stats.dataProgress} size={72} color="var(--token-emerald)" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data Engineering</p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">{stats.dataProgress}%</p>
                <p className="text-xs text-muted-foreground">SQL · dbt · Airflow · BigQuery</p>
                <Progress value={stats.dataProgress} className="mt-2 h-1.5 [&>div]:bg-[var(--token-emerald)]" />
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" asChild>
                <Link href="/roadmap"><ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={stats.pythonProgress} size={72} color="var(--token-amber)" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Python & FastAPI</p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">{stats.pythonProgress}%</p>
                <p className="text-xs text-muted-foreground">Python · FastAPI · SQLAlchemy · Docker</p>
                <Progress value={stats.pythonProgress} className="mt-2 h-1.5 [&>div]:bg-[var(--token-amber)]" />
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" asChild>
                <Link href="/roadmap"><ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* ── Activity & Actions ─────────────────────────────────────────────────── */}
    <div>
      <h2 className="text-sm font-medium text-foreground mb-3">Recent Activity</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            {recentActivity.length === 0 ? (
              <EmptyState icon={Zap} title="No activity yet" description="Complete a lesson or log a study session to earn XP." />
            ) : (
              <ul className="space-y-3">
                {(recentActivity as ActivityEvent[]).map((event) => (
                  <li key={event.id} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/20">
                      {eventIcon(event.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{event.reason || eventLabel(event.type)}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(event.createdAt)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[var(--token-emerald)]">+{event.points}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { href: "/lessons", icon: PlayCircle, label: "Start Lesson", color: "text-primary", bg: "bg-primary/8 hover:bg-primary/15" },
                { href: "/study-log", icon: Clock, label: "Log Study", color: "text-[var(--token-amber)]", bg: "bg-[var(--token-amber)]/8 hover:bg-[var(--token-amber)]/15" },
                { href: "/roadmap", icon: Map, label: "Roadmap", color: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/8 hover:bg-[var(--token-emerald)]/15" },
                { href: "/notes/new", icon: NotebookPen, label: "Add Note", color: "text-[var(--token-purple)]", bg: "bg-[var(--token-purple)]/8 hover:bg-[var(--token-purple)]/15" },
              ].map(({ href, icon: Icon, label, color, bg }) => (
                <Button key={href} variant="ghost" className={cn("h-auto flex-col gap-2 py-4 rounded-xl border border-border transition-all", bg)} asChild>
                  <Link href={href}>
                    <Icon className={cn("h-5 w-5", color)} />
                    <span className="text-xs text-foreground">{label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Topbar />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} userName={session.user.name ?? "Learner"} />
      </Suspense>
    </>
  );
}
