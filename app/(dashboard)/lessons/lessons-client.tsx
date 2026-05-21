"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Clock, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, minutesToHours } from "@/lib/utils";

type LessonWithMeta = {
  id: string;
  title: string;
  slug: string;
  sourceName: string;
  estimatedMinutes: number;
  difficulty: string;
  status: string;
  weekId: string;
  module: {
    id: string;
    title: string;
    track: { name: string; slug: string; color: string };
  };
  week: { id: string; weekNumber: number; theme: string; title: string };
};

type WeekGroup = {
  weekId: string;
  weekNumber: number;
  weekTitle: string;
  theme: string;
  lessons: LessonWithMeta[];
};

interface LessonsClientProps {
  weekGroups: WeekGroup[];
}

const TRACKS = ["All", "Web", "Data Engineering", "Python & FastAPI"] as const;
type TrackFilter = (typeof TRACKS)[number];

function difficultyClasses(d: string): string {
  switch (d) {
    case "beginner":
    case "easy":
      return "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20";
    case "intermediate":
    case "medium":
      return "bg-[var(--token-amber)]/10 text-[var(--token-amber)] border-[var(--token-amber)]/20";
    case "advanced":
    case "hard":
      return "bg-[var(--token-red)]/10 text-[var(--token-red)] border-[var(--token-red)]/20";
    default:
      return "bg-muted/40 text-muted-foreground border-border";
  }
}

function statusClasses(s: string): string {
  switch (s) {
    case "completed":
      return "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20";
    case "in-progress":
      return "bg-[var(--token-cyan)]/10 text-[var(--token-cyan)] border-[var(--token-cyan)]/20";
    case "locked":
      return "bg-muted/40 text-muted-foreground/60 border-border";
    default:
      return "bg-muted/40 text-muted-foreground border-border";
  }
}

export function LessonsClient({ weekGroups }: LessonsClientProps) {
  const [search, setSearch] = useState("");
  const [activeTrack, setActiveTrack] = useState<TrackFilter>("All");

  const filtered = useMemo(() => {
    return weekGroups
      .map((group) => ({
        ...group,
        lessons: group.lessons.filter((l) => {
          const matchesSearch =
            search.trim() === "" ||
            l.title.toLowerCase().includes(search.toLowerCase()) ||
            l.sourceName.toLowerCase().includes(search.toLowerCase());
          const matchesTrack =
            activeTrack === "All" ||
            (activeTrack === "Web" && l.module.track.slug === "web") ||
            (activeTrack === "Data Engineering" && l.module.track.slug === "data-engineering") ||
            (activeTrack === "Python & FastAPI" && l.module.track.slug === "python-fastapi");
          return matchesSearch && matchesTrack;
        }),
      }))
      .filter((g) => g.lessons.length > 0);
  }, [weekGroups, search, activeTrack]);

  const totalLessons = filtered.reduce((sum, g) => sum + g.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/40 p-1">
          <span className="px-2 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">TRACK</span>
          {TRACKS.map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={cn(
                "rounded-md px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
                activeTrack === track
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {track}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono bg-card/40 border-border/80"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
        <span className="font-bold text-foreground">{totalLessons}</span>
        <span>LESSON{totalLessons !== 1 ? "S" : ""} MATCHED</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center border border-border/40 bg-card/40 rounded-xl">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground/80">No lessons match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((group) => (
            <section key={group.weekId} className="space-y-3">
              {/* Week header */}
              <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-mono font-bold text-primary">
                  W{group.weekNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase">
                    SPRINT {String(group.weekNumber).padStart(2, "0")}
                  </p>
                  <h2 className="text-sm font-bold tracking-tight text-foreground">{group.weekTitle}</h2>
                  <p className="text-[10px] text-muted-foreground/70 italic font-mono">{group.theme}</p>
                </div>
                <span className="shrink-0 text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
                  {group.lessons.length} ITEM{group.lessons.length !== 1 ? "S" : ""}
                </span>
              </div>

              {/* Lessons grid */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    data-slot="card"
                    className="border border-border/80 bg-card/60 rounded-xl transition-all hover:shadow-sm hover:border-primary/30"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
                          {lesson.module.track.name}
                        </span>
                        <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", difficultyClasses(lesson.difficulty))}>
                          {lesson.difficulty}
                        </span>
                        <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", statusClasses(lesson.status))}>
                          {lesson.status}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-sm font-bold text-foreground tracking-tight">
                        {lesson.title}
                      </h3>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                        <span className="flex items-center gap-1 truncate">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{lesson.sourceName}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {minutesToHours(lesson.estimatedMinutes)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-border hover:bg-muted text-[10px] font-mono uppercase tracking-wider"
                        asChild
                      >
                        <Link href={`/lessons/${lesson.slug}`}>OPEN LESSON →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
