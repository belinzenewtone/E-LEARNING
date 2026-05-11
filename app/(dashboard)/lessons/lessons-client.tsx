"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Clock, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, minutesToHours, getDifficultyColor, getStatusColor } from "@/lib/utils";

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

const TRACKS = ["All", "Web", "Data Engineering"] as const;
type TrackFilter = (typeof TRACKS)[number];

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
            (activeTrack === "Data Engineering" &&
              l.module.track.slug === "data-engineering");
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
        {/* Track tabs */}
        <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
          {TRACKS.map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTrack === track
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {track}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {totalLessons} lesson{totalLessons !== 1 ? "s" : ""} found
      </p>

      {/* Week groups */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No lessons match your current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((group) => (
            <section key={group.weekId}>
              {/* Week header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  W{group.weekNumber}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Week {group.weekNumber} — {group.weekTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground italic">
                    {group.theme}
                  </p>
                </div>
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  {group.lessons.length} lesson
                  {group.lessons.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Lessons grid */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className="border-border/40 bg-card/60 transition-shadow hover:shadow-md hover:shadow-black/20"
                  >
                    <CardContent className="p-4">
                      {/* Track + difficulty badges */}
                      <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {lesson.module.track.name}
                        </Badge>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                            getDifficultyColor(lesson.difficulty)
                          )}
                        >
                          {lesson.difficulty}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                            getStatusColor(lesson.status)
                          )}
                        >
                          {lesson.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">
                        {lesson.title}
                      </h3>

                      {/* Meta */}
                      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {lesson.sourceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {minutesToHours(lesson.estimatedMinutes)}
                        </span>
                      </div>

                      {/* Action */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/lessons/${lesson.slug}`}>
                          Open Lesson
                        </Link>
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
