"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Pin, BookmarkCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDateShort, truncate } from "@/lib/utils";

type NoteTrack = { id: string; name: string; slug: string } | null;

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  reviewLater: boolean;
  confusing: boolean;
  createdAt: Date;
  lesson: { id: string; title: string; slug: string } | null;
  assignment: { id: string; title: string } | null;
  track: NoteTrack;
};

type FilterChip = "All" | "Pinned" | "Review Later" | "Confusing" | string;

interface NotesClientProps {
  notes: Note[];
  tracks: { id: string; name: string; slug: string }[];
}

export function NotesClient({ notes, tracks }: NotesClientProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");

  const chips: FilterChip[] = [
    "All",
    "Pinned",
    "Review Later",
    "Confusing",
    ...tracks.map((t) => t.name),
  ];

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        search.trim() === "" ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      let matchesFilter = true;
      if (activeFilter === "Pinned") matchesFilter = note.pinned;
      else if (activeFilter === "Review Later") matchesFilter = note.reviewLater;
      else if (activeFilter === "Confusing") matchesFilter = note.confusing;
      else if (activeFilter !== "All") {
        matchesFilter = note.track?.name === activeFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notes, search, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-sm"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === chip
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} note{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No notes match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="h-full cursor-pointer border-border/40 bg-card/60 transition-shadow hover:shadow-md hover:shadow-black/20">
                <CardContent className="p-4">
                  {/* Title + flags */}
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-foreground flex-1">
                      {note.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      {note.pinned && (
                        <Pin className="h-3.5 w-3.5 text-[var(--token-amber)]" />
                      )}
                      {note.reviewLater && (
                        <BookmarkCheck className="h-3.5 w-3.5 text-[var(--token-cyan)]" />
                      )}
                      {note.confusing && (
                        <AlertCircle className="h-3.5 w-3.5 text-[var(--token-red)]" />
                      )}
                    </div>
                  </div>

                  {/* Content preview */}
                  <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                    {truncate(note.content, 150)}
                  </p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {note.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 4 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          +{note.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: source + date */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>
                      {note.lesson
                        ? `Lesson: ${truncate(note.lesson.title, 25)}`
                        : note.assignment
                        ? `Assignment: ${truncate(note.assignment.title, 20)}`
                        : note.track
                        ? note.track.name
                        : "General"}
                    </span>
                    <span>{formatDateShort(note.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
