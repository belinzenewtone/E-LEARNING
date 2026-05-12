import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Lock, CheckCircle2, Zap, BookOpen, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatDateShort, getStatusColor } from "@/lib/utils";
import { getWeeksList } from "@/server/queries/weeks";
import { Topbar } from "@/components/layout/topbar";

const PHASES: { label: string; range: [number, number]; color: string; bg: string }[] = [
  { label: "Phase 1 — Foundations",     range: [1, 4],   color: "text-[var(--token-cyan)]",    bg: "bg-[var(--token-cyan)]/10 border-[var(--token-cyan)]/20"    },
  { label: "Phase 2 — Core Skills",     range: [5, 8],   color: "text-[var(--token-blue)]",    bg: "bg-[var(--token-blue)]/10 border-[var(--token-blue)]/20"    },
  { label: "Phase 3 — Advanced Topics", range: [9, 13],  color: "text-[var(--token-purple)]",  bg: "bg-[var(--token-purple)]/10 border-[var(--token-purple)]/20" },
  { label: "Phase 4 — Build",           range: [14, 17], color: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10 border-[var(--token-amber)]/20"  },
  { label: "Phase 5 — Capstone",        range: [18, 22], color: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/10 border-[var(--token-emerald)]/20" },
];

function getPhase(weekNumber: number) {
  return PHASES.find((p) => weekNumber >= p.range[0] && weekNumber <= p.range[1]);
}

function WeekStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-[var(--token-emerald)]" />;
  if (status === "active")    return <Zap className="h-4 w-4 text-[var(--token-cyan)]" />;
  return <Lock className="h-4 w-4 text-muted-foreground/30" />;
}

export default async function WeeksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const weeks = await getWeeksList();

  const totalWeeks = weeks.length;
  const completedWeeks = weeks.filter((w) => w.status === "completed").length;
  const activeWeek = weeks.find((w) => w.status === "active");
  const overallProgress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  // Group by phase
  type WeekItem = (typeof weeks)[0];
  const grouped = PHASES.map((phase) => ({
    phase,
    weeks: weeks.filter((w) => w.weekNumber >= phase.range[0] && w.weekNumber <= phase.range[1]),
  }));

  return (
    <div className="min-h-full">
      <Topbar title="Weekly Sprints" subtitle="22 weeks · 5 phases · 2 tracks" />

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{overallProgress}%</p>
            <Progress value={overallProgress} className="mt-2 h-1" />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
            <p className="mt-1 text-2xl font-bold text-[var(--token-emerald)]">{completedWeeks}</p>
            <p className="text-xs text-muted-foreground">of {totalWeeks} weeks</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Sprint</p>
            <p className="mt-1 text-2xl font-bold text-[var(--token-cyan)]">
              {activeWeek ? `W${activeWeek.weekNumber}` : "—"}
            </p>
            {activeWeek && <p className="text-xs text-muted-foreground truncate">{activeWeek.theme}</p>}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalWeeks - completedWeeks}</p>
            <p className="text-xs text-muted-foreground">weeks to go</p>
          </div>
        </div>

        {/* Phases */}
        {grouped.map(({ phase, weeks: phaseWeeks }) => {
          if (phaseWeeks.length === 0) return null;
          const phaseCompleted = phaseWeeks.filter((w) => w.status === "completed").length;
          const phaseProgress = Math.round((phaseCompleted / phaseWeeks.length) * 100);

          return (
            <section key={phase.label}>
              {/* Phase header */}
              <div className="mb-4 flex items-center gap-3">
                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", phase.color, phase.bg)}>
                  {phase.label}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-xs text-muted-foreground">{phaseCompleted}/{phaseWeeks.length} done</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {phaseWeeks.map((week: WeekItem) => {
                  const isActive = week.status === "active";
                  const isDone = week.status === "completed";
                  return (
                    <Card
                      key={week.id}
                      className={cn(
                        "border-border bg-card transition-all duration-200 hover:shadow-md hover:shadow-black/20 hover:-translate-y-0.5",
                        isActive && "border-primary/40 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]",
                        isDone && "border-emerald-500/20 opacity-80"
                      )}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                            isActive ? "bg-primary/15 text-primary border border-primary/20"
                            : isDone ? "bg-emerald-500/10 text-[var(--token-emerald)] border border-emerald-500/20"
                            : "bg-muted/30 text-muted-foreground border border-border"
                          )}>
                            W{week.weekNumber}
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <WeekStatusIcon status={week.status} />
                            <span className={cn("text-[10px] font-semibold capitalize rounded-full border px-2 py-0.5", getStatusColor(week.status))}>
                              {week.status}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-1 leading-snug">
                            {week.title}
                          </h3>
                          <p className="text-xs text-muted-foreground italic line-clamp-1 mt-0.5">
                            {week.theme}
                          </p>
                        </div>

                        {/* Goals preview */}
                        {week.goals.length > 0 && (
                          <ul className="space-y-1">
                            {week.goals.slice(0, 2).map((goal: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <ChevronRight className="mt-0.5 h-2.5 w-2.5 shrink-0 text-muted-foreground/40" />
                                <span className="line-clamp-1">{goal}</span>
                              </li>
                            ))}
                            {week.goals.length > 2 && (
                              <li className="text-[10px] text-muted-foreground/50 pl-4">
                                +{week.goals.length - 2} more goals
                              </li>
                            )}
                          </ul>
                        )}

                        {/* Meta row */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateShort(week.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {week.estimatedHours}h
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                              <BookOpen className="h-3 w-3" /> {week._count.lessons}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <FileText className="h-3 w-3" /> {week._count.assignments}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          className="w-full"
                          disabled={week.status === "locked"}
                          asChild={week.status !== "locked"}
                        >
                          {week.status !== "locked" ? (
                            <Link href={`/weeks/${week.weekNumber}`}>
                              {isActive ? "Continue Sprint" : isDone ? "Review Sprint" : "View Sprint"}
                            </Link>
                          ) : (
                            <span>Locked</span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
