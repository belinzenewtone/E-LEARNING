import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  Zap, Flame, TrendingUp, Clock, BookOpen, AlertCircle, Calendar,
  CheckCircle2, PlayCircle, FileText, PenLine, Map, NotebookPen,
  ArrowRight, ChevronRight, Target, Activity, LayoutDashboard, Terminal,
} from "lucide-react";
import {
  getDashboardStats, getTodaysTasks, getRecentActivity, getCurrentWeekAssignments, getDueReviews,
} from "@/server/queries/dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, minutesToHours, timeAgo, getStatusColor, formatDate } from "@/lib/utils";

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
  if (hour < 12) return "Welcome back";
  if (hour < 17) return "Welcome back";
  return "Welcome back";
}

function eventLabel(type: string): string {
  const labels: Record<string, string> = {
    "lesson-complete": "Lesson completed",
    "assignment-submit": "Assignment submitted",
    "retro": "Retrospective submitted",
    "study-log": "Study session logged",
    "note-added": "Personal note added",
    "checkpoint": "Checkpoint verified",
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
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground/60" />
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
  const todayLabel = format(now, "EEEE, MMMM dd, yyyy").toUpperCase();
  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Executive Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM STATUS // {todayLabel}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs text-muted-foreground/80 max-w-xl">
            Track your course roadmap progression and active sprint checkpoints.
          </p>
        </div>

        {/* Dynamic Track HUD */}
        <div className="flex flex-wrap items-center gap-2">
          {stats.currentWeek && (
            <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/30 px-3 py-1 text-[11px] font-mono text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-primary/75" />
              <span>Sprint Week {stats.currentWeek.weekNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/30 px-3 py-1 text-[11px] font-mono text-muted-foreground">
            <Terminal className="h-3.5 w-3.5 text-[var(--token-emerald)]/75" />
            <span>LV {Math.floor(stats.totalXp / 500) + 1}</span>
          </div>
        </div>
      </div>

      {/* ── Executive Overview Progress Bar Row ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 bg-card/40 border border-border/40 rounded-xl p-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Overall Path</span>
            <span className="font-mono text-foreground font-semibold">{stats.overallProgress}%</span>
          </div>
          <Progress value={stats.overallProgress} className="h-1 bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Web Track</span>
            <span className="font-mono text-foreground font-semibold">{stats.webProgress}%</span>
          </div>
          <Progress value={stats.webProgress} className="h-1 bg-muted [&>div]:bg-[var(--token-cyan)]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Data Track</span>
            <span className="font-mono text-foreground font-semibold">{stats.dataProgress}%</span>
          </div>
          <Progress value={stats.dataProgress} className="h-1 bg-muted [&>div]:bg-[var(--token-emerald)]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Python Track</span>
            <span className="font-mono text-foreground font-semibold">{stats.pythonProgress}%</span>
          </div>
          <Progress value={stats.pythonProgress} className="h-1 bg-muted [&>div]:bg-[var(--token-amber)]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Weekly Score</span>
            <span className="font-mono text-foreground font-semibold">{stats.weeklyScore}%</span>
          </div>
          <Progress value={stats.weeklyScore} className="h-1 bg-muted [&>div]:bg-[var(--token-purple)]" />
        </div>
      </div>

      {/* ── Stat panels ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard title="Learning Points" value={stats.totalXp.toLocaleString()} subtitle="Cumulative Credits" icon={Zap} color="primary" />
        <StatCard title="Daily Continuity" value={`${stats.streak}d`} subtitle={stats.streak > 0 ? "Consecutive focus sequence" : "Begin study sequence"} icon={Flame} color="warning" />
        <StatCard title="Study Velocity" value={`${(stats.studyMinutesThisWeek / 60).toFixed(1)}h`} subtitle="Accumulated this week" icon={Clock} color="success" />
        <StatCard title="Action Items" value={stats.overdueAssignments} subtitle={stats.overdueAssignments === 0 ? "Sprint clear" : "Pending submissions"} icon={AlertCircle} color={stats.overdueAssignments > 0 ? "danger" : "success"} />
      </div>

      {/* ── Due for review banner ────────────────────────────────────────────── */}
      {dueReviews.length > 0 && (
        <Card className="border border-border bg-card border-l-2 border-l-[var(--token-amber)] shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--token-amber)]" />
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--token-amber)]">
                Spaced Repetition Review Required ({dueReviews.length} Lesson{dueReviews.length !== 1 ? "s" : ""} Due)
              </CardTitle>
            </div>
            <Button size="xs" variant="outline" asChild className="border-border text-foreground hover:bg-muted text-[10px] h-7 px-2.5 font-mono">
              <Link href="/review">LAUNCH REVIEW</Link>
            </Button>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-xs text-muted-foreground/95">
              Spaced repetition verified checkpoints are currently due for: <span className="font-mono text-foreground font-semibold">{dueReviews.map(r => r.title).join(", ")}</span>. Completing this keeps your recall retention high.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Daily Plan & Active Sprint Tracker ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">Today&apos;s Learning Plan</h2>
            {stats.lessonsCompletedToday > 0 && (
              <Badge variant="success" className="gap-1 rounded-md text-[10px] font-mono py-0.5 px-2 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20">
                <CheckCircle2 className="h-3 w-3" />
                {stats.lessonsCompletedToday} completed today
              </Badge>
            )}
          </div>
          <Card className="border border-border/80 bg-card/60">
            <CardContent className="p-2">
              {todaysTasks.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    icon={BookOpen}
                    title="Path schedule clear"
                    description="You have successfully processed all planned pipeline items for today. Check the curriculum roadmap."
                    action={{ label: "View Roadmap", href: "/roadmap" }}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-border/30">
                  {(todaysTasks as TodaysTask[]).map((lesson) => {
                    const isDone = lesson.progress[0]?.status === "completed";
                    return (
                      <li key={lesson.id} data-list-item className="group">
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                            {isDone ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-[var(--token-emerald)]" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/45 group-hover:border-primary/75 transition-colors" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary", isDone && "line-through text-muted-foreground/60")}>
                              {lesson.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/70 font-mono">
                              <span>{lesson.module.title.toUpperCase()}</span>
                              <span>·</span>
                              <span>{minutesToHours(lesson.estimatedMinutes).toUpperCase()}</span>
                              {lesson.sourceType && (
                                <>
                                  <span>·</span>
                                  <span>{lesson.sourceType.toUpperCase()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={cn(
                              "hidden rounded px-2 py-0.5 text-[9px] font-mono font-semibold sm:inline-block tracking-wider uppercase border",
                              isDone ? "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20" : "bg-muted text-muted-foreground border-border"
                            )}>
                              {lesson.progress[0]?.status ?? "PENDING"}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Sprint Info Panel */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">Active Sprint Details</h2>
          <Card className="border border-border/80 bg-card/60">
            <CardContent className="p-4 space-y-4">
              {stats.currentWeek ? (
                <>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 font-mono">
                      Sprint Iteration Week {stats.currentWeek.weekNumber}
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground tracking-tight">{stats.currentWeek.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed italic border-l border-border/70 pl-2">
                      &quot;{stats.currentWeek.theme}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>DUE {formatDate(stats.currentWeek.endDate).toUpperCase()}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-semibold">
                      <span className="text-muted-foreground">Sprint Target Score</span>
                      <span className={cn(
                        stats.weeklyScore >= 80 ? "text-[var(--token-emerald)]" : stats.weeklyScore >= 50 ? "text-[var(--token-amber)]" : "text-foreground"
                      )}>
                        {stats.weeklyScore}%
                      </span>
                    </div>
                    <Progress value={stats.weeklyScore} className="h-1.5 bg-muted" />
                  </div>
                  {stats.overdueAssignments > 0 && (
                    <div className="flex items-center gap-2 rounded-md border border-[var(--token-red)]/20 bg-[var(--token-red)]/5 px-3 py-2 text-[11px] font-mono text-[var(--token-red)]">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{stats.overdueAssignments} assignment{stats.overdueAssignments !== 1 ? "s" : ""} overdue</span>
                    </div>
                  )}
                  {weekAssignments.length > 0 && (
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 font-mono">Sprint Submissions</p>
                      <div className="space-y-1.5">
                        {(weekAssignments as WeekAssignment[]).slice(0, 3).map((a) => {
                          const done = a.submissions.length > 0;
                          return (
                            <Link key={a.id} href={`/assignments/${a.id}`} className="flex items-center justify-between group text-[11px]">
                              <span className={cn("truncate max-w-[170px] text-muted-foreground group-hover:text-primary transition-colors", done && "line-through text-muted-foreground/50")}>
                                {a.title}
                              </span>
                              {done ? (
                                <span className="font-mono text-[9px] text-[var(--token-emerald)] bg-[var(--token-emerald)]/10 px-1.5 py-0.2 rounded border border-[var(--token-emerald)]/20 uppercase font-semibold">done</span>
                              ) : (
                                <span className="font-mono text-[9px] text-muted-foreground/60 uppercase">pending</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full text-xs font-mono border-border hover:bg-muted" asChild>
                    <Link href={`/weeks/${stats.currentWeek.weekNumber}`}>
                      EXPLORE SPRINT BOARD
                    </Link>
                  </Button>
                </>
              ) : (
                <EmptyState icon={Target} title="No Active Sprint Cycle" description="Sprints activate based on course schedules." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Curriculum Progress Matrix ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">Curriculum Track Matrices</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Web Development",
              sub: "JavaScript · TypeScript · Next.js",
              val: stats.webProgress,
              color: "bg-[var(--token-cyan)]",
              link: "/roadmap"
            },
            {
              title: "Data Engineering",
              sub: "SQL · dbt · Airflow · BigQuery",
              val: stats.dataProgress,
              color: "bg-[var(--token-emerald)]",
              link: "/roadmap"
            },
            {
              title: "Python & FastAPI",
              sub: "Python · FastAPI · SQLAlchemy · Docker",
              val: stats.pythonProgress,
              color: "bg-[var(--token-amber)]",
              link: "/roadmap"
            }
          ].map((track, i) => (
            <Card key={i} className="border border-border/80 bg-card/60 transition-all" data-slot="card">
              <CardContent className="p-4 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground leading-none">{track.title}</p>
                    <p className="text-[10px] text-muted-foreground/75 font-mono">{track.sub}</p>
                  </div>
                  <Button size="xs" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={track.link}><ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground/80">Track Progression</span>
                    <span className="font-semibold text-foreground">{track.val}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded overflow-hidden">
                    <div className={cn("h-full rounded transition-all duration-300", track.color)} style={{ width: `${track.val}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── System Audit Log & CLI commands ──────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">System Audit Log</h2>
          <Card className="border border-border/80 bg-card/60 max-h-[300px] overflow-y-auto scrollbar-thin">
            <CardContent className="p-4">
              {recentActivity.length === 0 ? (
                <div className="py-4">
                  <EmptyState icon={Activity} title="Log database empty" description="Complete checkpoints or curriculum lessons to initiate logs." />
                </div>
              ) : (
                <ul className="space-y-3 divide-y divide-border/20">
                  {(recentActivity as ActivityEvent[]).map((event, i) => (
                    <li key={event.id} className={cn("flex items-center gap-3 text-xs", i > 0 && "pt-2.5")}>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted/40">
                        {eventIcon(event.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{event.reason || eventLabel(event.type)}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/60">{timeAgo(event.createdAt).toUpperCase()}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-[var(--token-emerald)]">+{event.points} U</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">Command Shortcuts</h2>
          <Card className="border border-border/80 bg-card/60">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/lessons", icon: PlayCircle, label: "Lessons", sub: "Initialize task" },
                  { href: "/study-log", icon: Clock, label: "Study Log", sub: "Verify velocity" },
                  { href: "/roadmap", icon: Map, label: "Roadmap", sub: "Explore paths" },
                  { href: "/notes/new", icon: NotebookPen, label: "Add Note", sub: "Capture insights" },
                ].map(({ href, icon: Icon, label, sub }) => (
                  <Button key={href} variant="outline" className="h-auto flex-col items-start gap-1.5 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/40 hover:border-primary/50 text-left transition-all group" asChild>
                    <Link href={href}>
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-foreground leading-none">{label}</span>
                        <span className="block text-[9px] font-mono text-muted-foreground/60 tracking-tight leading-none uppercase">{sub}</span>
                      </div>
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
