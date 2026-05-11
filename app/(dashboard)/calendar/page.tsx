import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, Zap, CalendarDays, MapPin } from "lucide-react";
import { getWeeksList } from "@/server/queries/weeks";
import { Topbar } from "@/components/layout/topbar";
import { cn, formatDateShort } from "@/lib/utils";
import { isWithinInterval, startOfDay } from "date-fns";

// ── Phase config ─────────────────────────────────────────────────────────────

const PHASES: {
  number: number;
  label: string;
  range: [number, number];
  color: string;
  bg: string;
  border: string;
  glow: string;
  dot: string;
}[] = [
  {
    number: 1,
    label: "Phase 1 — Foundations",
    range: [1, 4],
    color: "text-[var(--token-cyan)]",
    bg: "bg-cyan-400/8",
    border: "border-cyan-400/20",
    glow: "shadow-cyan-400/20",
    dot: "bg-cyan-400",
  },
  {
    number: 2,
    label: "Phase 2 — Core Skills",
    range: [5, 8],
    color: "text-[var(--token-blue)]",
    bg: "bg-blue-400/8",
    border: "border-blue-400/20",
    glow: "shadow-blue-400/20",
    dot: "bg-blue-400",
  },
  {
    number: 3,
    label: "Phase 3 — Advanced Topics",
    range: [9, 13],
    color: "text-[var(--token-purple)]",
    bg: "bg-purple-400/8",
    border: "border-purple-400/20",
    glow: "shadow-purple-400/20",
    dot: "bg-purple-400",
  },
  {
    number: 4,
    label: "Phase 4 — Build",
    range: [14, 17],
    color: "text-[var(--token-amber)]",
    bg: "bg-amber-400/8",
    border: "border-amber-400/20",
    glow: "shadow-amber-400/20",
    dot: "bg-amber-400",
  },
  {
    number: 5,
    label: "Phase 5 — Capstone",
    range: [18, 22],
    color: "text-[var(--token-emerald)]",
    bg: "bg-emerald-400/8",
    border: "border-emerald-400/20",
    glow: "shadow-emerald-400/20",
    dot: "bg-emerald-400",
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

type Week = Awaited<ReturnType<typeof getWeeksList>>[0];

// ── Week card ─────────────────────────────────────────────────────────────────

function WeekCard({
  week,
  phase,
  isToday,
}: {
  week: Week;
  phase: (typeof PHASES)[0];
  isToday: boolean;
}) {
  const isActive = week.status === "active";
  const isDone = week.status === "completed";
  const isLocked = week.status === "locked";

  const cardBase = cn(
    "relative flex flex-col gap-1.5 rounded-xl border p-3 transition-all duration-200",
    "min-h-[100px]",
    isLocked
      ? "opacity-50 cursor-default bg-muted/10 border-border/30"
      : "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
    isActive &&
      cn(
        "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_4px_16px_-4px]",
        phase.glow
      ),
    isDone && "border-emerald-500/25 bg-emerald-500/5",
    !isActive && !isDone && !isLocked && "border-border/40 bg-card/50",
    isToday &&
      "ring-2 ring-primary/30"
  );

  const inner = (
    <div className={cardBase}>
      {/* Current date marker */}
      {isToday && (
        <span className="absolute -top-2 left-3 flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
          <MapPin className="h-2.5 w-2.5" /> Today
        </span>
      )}

      {/* Week number badge */}
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
            isActive
              ? "bg-primary/15 text-primary border border-primary/20"
              : isDone
              ? "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border border-[var(--token-emerald)]/20"
              : "bg-muted/30 text-muted-foreground border border-border/30"
          )}
        >
          {week.weekNumber}
        </span>

        {/* Status icon */}
        <span className="mt-0.5">
          {isDone ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--token-emerald)]" />
          ) : isActive ? (
            <Zap className="h-3.5 w-3.5 text-primary" />
          ) : isLocked ? (
            <Lock className="h-3 w-3 text-muted-foreground/30" />
          ) : null}
        </span>
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-[11px] font-semibold leading-snug line-clamp-2",
          isLocked
            ? "text-muted-foreground/40"
            : isDone
            ? "text-muted-foreground"
            : "text-foreground"
        )}
      >
        {week.title}
      </p>

      {/* Date range */}
      <p className="mt-auto text-[9px] text-muted-foreground/50 tabular-nums">
        {formatDateShort(week.startDate)} – {formatDateShort(week.endDate)}
      </p>
    </div>
  );

  if (isLocked) return inner;

  return (
    <Link href={`/weeks/${week.weekNumber}`} className="block">
      {inner}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const weeks = await getWeeksList();
  const now = startOfDay(new Date());

  const totalWeeks = weeks.length;
  const completedWeeks = weeks.filter((w) => w.status === "completed").length;
  const activeWeek = weeks.find((w) => w.status === "active");

  // Group weeks by phase
  const grouped = PHASES.map((phase) => ({
    phase,
    weeks: weeks.filter(
      (w) => w.weekNumber >= phase.range[0] && w.weekNumber <= phase.range[1]
    ),
  }));

  return (
    <div className="min-h-full">
      <Topbar
        title="Calendar"
        subtitle="Your 22-week learning journey"
      />

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">

        {/* ── Progress summary ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">22-Week Roadmap</span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-[var(--token-emerald)]">{completedWeeks}</span>
            {" "}of{" "}
            <span className="font-semibold text-foreground">{totalWeeks}</span>
            {" "}weeks complete
          </span>
          {activeWeek && (
            <>
              <div className="h-4 w-px bg-border/50" />
              <span className="text-sm text-muted-foreground">
                Currently on{" "}
                <span className="font-semibold text-primary">
                  Week {activeWeek.weekNumber}
                </span>
              </span>
            </>
          )}
          <div className="ml-auto hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/20" /> Locked
            </span>
          </div>
        </div>

        {/* ── Phase sections ────────────────────────────────────────────────── */}
        {grouped.map(({ phase, weeks: phaseWeeks }) => {
          if (phaseWeeks.length === 0) return null;

          const phaseCompleted = phaseWeeks.filter(
            (w) => w.status === "completed"
          ).length;
          const phaseProgress = Math.round(
            (phaseCompleted / phaseWeeks.length) * 100
          );

          return (
            <section key={phase.number}>
              {/* Phase header */}
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      phase.dot
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      phase.color
                    )}
                  >
                    {phase.label}
                  </span>
                  <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium text-muted-foreground border-border/40 bg-muted/20">
                    W{phase.range[0]}–W{phase.range[1]}
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {phaseCompleted}/{phaseWeeks.length} done
                    {phaseWeeks.length > 0 && (
                      <span className="ml-1 text-muted-foreground/50">
                        ({phaseProgress}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Phase progress bar */}
              {phaseCompleted > 0 && (
                <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted/20">
                  <div
                    className={cn("h-full rounded-full transition-all", phase.dot)}
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
              )}

              {/* Week cards grid */}
              <div
                className={cn(
                  "grid gap-3",
                  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                )}
              >
                {phaseWeeks.map((week) => {
                  // Is today within this week's date range?
                  const isCurrentWeek =
                    week.startDate &&
                    week.endDate &&
                    isWithinInterval(now, {
                      start: startOfDay(new Date(week.startDate)),
                      end: startOfDay(new Date(week.endDate)),
                    });

                  return (
                    <WeekCard
                      key={week.id}
                      week={week}
                      phase={phase}
                      isToday={!!isCurrentWeek}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Mobile legend ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:hidden">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/20" /> Locked
          </span>
        </div>

      </div>
    </div>
  );
}
