"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Lock, BookOpen, CheckCircle2, Circle, Clock, Layers, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/progress-ring";
import { EmptyState } from "@/components/shared/empty-state";

// ── Phase groupings ─────────────────────────────────────────────────────────

const PHASE_LABELS: Record<number, string> = {
  1: "PHASE 01 // FOUNDATIONS",
  2: "PHASE 02 // CORE SKILLS",
  3: "PHASE 03 // ADVANCED",
  4: "PHASE 04 // SPECIALISATION",
  5: "PHASE 05 // MASTERY & CAPSTONE",
};

// ── Types ────────────────────────────────────────────────────────────────────

type LessonInModule = {
  id: string;
  title: string;
  slug: string;
  status: string;
  estimatedMinutes: number;
  difficulty: string;
  order: number;
  progress: { status: string }[];
};

type ModuleWithCounts = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  order: number;
  estimatedHours: number;
  prerequisiteModuleIds: string[];
  lessonCount: number;
  completedCount: number;
  inProgressCount: number;
  progressPercent: number;
  lessons: LessonInModule[];
};

type TrackData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  targetHours: number;
  modules: ModuleWithCounts[];
};

interface RoadmapClientProps {
  webTrack: TrackData | null;
  dataTrack: TrackData | null;
  pythonTrack: TrackData | null;
}

type StatusFilter = "all" | "active" | "completed" | "locked";
type TrackFilter = "all" | "web" | "data" | "python";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20";
    case "active":
    case "in-progress":
      return "bg-[var(--token-cyan)]/10 text-[var(--token-cyan)] border-[var(--token-cyan)]/20";
    case "locked":
      return "bg-muted/40 text-muted-foreground/60 border-border";
    default:
      return "bg-muted/40 text-muted-foreground border-border";
  }
}

function LessonRow({ lesson }: { lesson: LessonInModule }) {
  const statusIcon =
    lesson.status === "completed" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--token-emerald)]" />
    ) : lesson.status === "in-progress" ? (
      <Circle className="h-3.5 w-3.5 text-[var(--token-cyan)] fill-[var(--token-cyan)]/20" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
    );

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors group"
    >
      <span className="shrink-0">{statusIcon}</span>
      <span className="min-w-0 flex-1 text-xs text-muted-foreground/80 group-hover:text-foreground transition-colors truncate">
        {lesson.title}
      </span>
      <span className="shrink-0 text-[9px] font-mono text-muted-foreground/60">
        {lesson.estimatedMinutes}M
      </span>
    </Link>
  );
}

function ModuleCard({
  module,
  defaultExpanded,
}: {
  module: ModuleWithCounts;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? module.status === "active");
  const isLocked = module.status === "locked";

  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 transition-all",
        isLocked ? "opacity-60" : "hover:shadow-sm"
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((p) => !p)}
        disabled={isLocked}
        aria-expanded={expanded}
      >
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            module.status === "completed"
              ? "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20"
              : module.status === "active"
              ? "bg-[var(--token-cyan)]/10 text-[var(--token-cyan)] border-[var(--token-cyan)]/20"
              : "bg-muted/40 text-muted-foreground border-border"
          )}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : module.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground tracking-tight">{module.title}</span>
            <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", statusBadge(module.status))}>
              {module.status}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">
            {module.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {module.lessonCount} LESSONS
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.estimatedHours}H
            </span>
            {module.completedCount > 0 && (
              <span className="text-[var(--token-emerald)]">
                {module.completedCount}/{module.lessonCount} DONE
              </span>
            )}
          </div>
          {module.lessonCount > 0 && (
            <div className="mt-2 h-1 bg-muted rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300 bg-primary"
                style={{ width: `${module.progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {!isLocked && (
          <span className="mt-1 shrink-0 text-muted-foreground/60">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>

      {!isLocked && module.lessons.length > 0 && (
        <div
          className={cn(
            "accordion transition-[grid-template-rows] duration-[220ms] ease-in-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div>
            <div className="border-t border-border/40 divide-y divide-border/30">
              {module.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackColumn({
  track,
  statusFilter,
  color,
}: {
  track: TrackData;
  statusFilter: StatusFilter;
  color: string;
}) {
  const phaseGroups = useMemo(() => {
    const groups: Record<number, ModuleWithCounts[]> = {};
    for (const mod of track.modules) {
      const phase = Math.ceil(mod.order / 3) || 1;
      if (!groups[phase]) groups[phase] = [];
      groups[phase].push(mod);
    }
    return groups;
  }, [track.modules]);

  const filteredGroups = useMemo(() => {
    const result: Record<number, ModuleWithCounts[]> = {};
    for (const [phaseStr, mods] of Object.entries(phaseGroups)) {
      const phase = parseInt(phaseStr, 10);
      const filtered = mods.filter((m) =>
        statusFilter === "all" ? true : m.status === statusFilter
      );
      if (filtered.length > 0) result[phase] = filtered;
    }
    return result;
  }, [phaseGroups, statusFilter]);

  const totalLessons = track.modules.reduce((s, m) => s + m.lessonCount, 0);
  const completedLessons = track.modules.reduce((s, m) => s + m.completedCount, 0);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-5">
      <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl transition-all hover:shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={progressPct} size={72} color={color} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase">
                TRACK
              </p>
              <h2 className="font-bold text-foreground tracking-tight">{track.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground/80">{track.description}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                <span className="font-bold text-foreground">{completedLessons}</span>
                <span>/</span>
                <span>{totalLessons} LESSONS</span>
                <span>·</span>
                <span>{track.targetHours}H TARGET</span>
              </div>
              <div className="mt-2 h-1 bg-muted rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{ width: `${progressPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(filteredGroups).length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No modules match"
          description="Try adjusting your filters."
        />
      ) : (
        Object.entries(filteredGroups)
          .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
          .map(([phaseStr, mods]) => {
            const phase = parseInt(phaseStr, 10);
            return (
              <div key={phase} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="shrink-0 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase px-2 py-0.5 rounded border border-border/60 bg-muted/30">
                    {PHASE_LABELS[phase] ?? `PHASE ${phase}`}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                {mods.map((mod) => (
                  <ModuleCard key={mod.id} module={mod} />
                ))}
              </div>
            );
          })
      )}
    </div>
  );
}

export function RoadmapClient({ webTrack, dataTrack, pythonTrack }: RoadmapClientProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Done" },
    { value: "locked", label: "Locked" },
  ];

  const trackOptions: { value: TrackFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "web", label: "Web" },
    { value: "data", label: "Data" },
    { value: "python", label: "Python" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6 mb-2">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM // CURRICULUM ROADMAP
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Map className="h-5 w-5 text-primary/75" />
            Roadmap
          </h1>
          <p className="text-xs text-muted-foreground/80 max-w-xl">
            Your 22-week learning trajectory across Web, Data Engineering, and Python &amp; FastAPI tracks.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider" asChild>
          <Link href="/dashboard">← DASHBOARD</Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/40 p-1">
          <span className="px-2 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">STATUS</span>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "rounded-md px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/40 p-1">
          <span className="px-2 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">TRACK</span>
          {trackOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTrackFilter(opt.value)}
              className={cn(
                "rounded-md px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
                trackFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks grid */}
      <div
        className={cn(
          "grid gap-6",
          trackFilter === "all" ? "lg:grid-cols-3" : "max-w-2xl"
        )}
      >
        {(trackFilter === "all" || trackFilter === "web") && webTrack && (
          <TrackColumn track={webTrack} statusFilter={statusFilter} color="var(--token-cyan)" />
        )}
        {(trackFilter === "all" || trackFilter === "data") && dataTrack && (
          <TrackColumn track={dataTrack} statusFilter={statusFilter} color="var(--token-emerald)" />
        )}
        {(trackFilter === "all" || trackFilter === "python") && pythonTrack && (
          <TrackColumn track={pythonTrack} statusFilter={statusFilter} color="var(--token-amber)" />
        )}
      </div>
    </div>
  );
}
