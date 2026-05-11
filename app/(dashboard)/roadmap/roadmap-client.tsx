"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Lock, BookOpen, CheckCircle2, Circle, Clock, Layers } from "lucide-react";
import { cn, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/progress-ring";
import { EmptyState } from "@/components/shared/empty-state";

// ── Phase groupings ───────────────────────────────────────────────────────────

const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1: Foundations",
  2: "Phase 2: Core Skills",
  3: "Phase 3: Advanced",
  4: "Phase 4: Specialisation",
  5: "Phase 5: Mastery & Capstone",
};

// ── Types ──────────────────────────────────────────────────────────────────────

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
}

// ── Status filter options ─────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "completed" | "locked";
type TrackFilter = "both" | "web" | "data";

// ── Module card ───────────────────────────────────────────────────────────────

function LessonRow({ lesson }: { lesson: LessonInModule }) {
  const statusIcon =
    lesson.status === "completed" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    ) : lesson.status === "in-progress" ? (
      <Circle className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
    );

  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors group">
      <span className="shrink-0">{statusIcon}</span>
      <Link
        href={`/lessons/${lesson.slug}`}
        className="min-w-0 flex-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate"
      >
        {lesson.title}
      </Link>
      <span className="shrink-0 text-[10px] text-muted-foreground/60">
        {lesson.estimatedMinutes}m
      </span>
    </div>
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
      className={cn(
        "rounded-xl border bg-card/40 transition-all",
        isLocked
          ? "border-border/30 opacity-60"
          : "border-border/50 hover:border-border/80 hover:shadow-sm"
      )}
    >
      {/* Module header */}
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((p) => !p)}
        disabled={isLocked}
        aria-expanded={expanded}
      >
        {/* Status icon */}
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            module.status === "completed"
              ? "bg-emerald-400/10 text-emerald-400"
              : module.status === "active"
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-muted/50 text-muted-foreground"
          )}
        >
          {isLocked ? (
            <Lock className="h-4 w-4" />
          ) : module.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {module.title}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                getStatusColor(module.status)
              )}
            >
              {module.status}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {module.description}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {module.lessonCount} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.estimatedHours}h
            </span>
            {module.completedCount > 0 && (
              <span className="text-emerald-400">
                {module.completedCount}/{module.lessonCount} done
              </span>
            )}
          </div>
          {module.lessonCount > 0 && (
            <Progress
              value={module.progressPercent}
              className="mt-2 h-1"
            />
          )}
        </div>

        {/* Expand chevron */}
        {!isLocked && (
          <span className="mt-1 shrink-0 text-muted-foreground">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {/* Lessons list */}
      {expanded && !isLocked && module.lessons.length > 0 && (
        <div className="border-t border-border/30 px-4 pb-3 pt-2">
          {module.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Track column ──────────────────────────────────────────────────────────────

function TrackColumn({
  track,
  statusFilter,
  color,
}: {
  track: TrackData;
  statusFilter: StatusFilter;
  color: string;
}) {
  // group modules by phase
  const phaseGroups = useMemo(() => {
    const groups: Record<number, ModuleWithCounts[]> = {};
    for (const mod of track.modules) {
      // derive phase from order: 1-3 → phase1, 4-6 → phase2, etc.
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
    <div className="space-y-6">
      {/* Track header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={progressPct} size={72} color={color} />
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-foreground">{track.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{track.description}</p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{completedLessons}/{totalLessons} lessons</span>
                <span>·</span>
                <span>{track.targetHours}h target</span>
              </div>
              <Progress value={progressPct} className="mt-2 h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase groups */}
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
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="shrink-0 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {PHASE_LABELS[phase] ?? `Phase ${phase}`}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
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

// ── Main client component ─────────────────────────────────────────────────────

export function RoadmapClient({ webTrack, dataTrack }: RoadmapClientProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("both");

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "locked", label: "Locked" },
  ];

  const trackOptions: { value: TrackFilter; label: string }[] = [
    { value: "both", label: "Both Tracks" },
    { value: "web", label: "Web" },
    { value: "data", label: "Data Eng." },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Roadmap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your 22-week learning journey across Web Development and Data Engineering.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Track filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-1">
          {trackOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTrackFilter(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                trackFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">← Dashboard</Link>
        </Button>
      </div>

      {/* Tracks grid */}
      <div
        className={cn(
          "grid gap-8",
          trackFilter === "both" ? "lg:grid-cols-2" : "max-w-2xl"
        )}
      >
        {(trackFilter === "both" || trackFilter === "web") && webTrack && (
          <TrackColumn
            track={webTrack}
            statusFilter={statusFilter}
            color="#22d3ee"
          />
        )}
        {(trackFilter === "both" || trackFilter === "data") && dataTrack && (
          <TrackColumn
            track={dataTrack}
            statusFilter={statusFilter}
            color="#34d399"
          />
        )}
      </div>
    </div>
  );
}
