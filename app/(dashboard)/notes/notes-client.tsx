"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Pin, BookmarkCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-xs font-mono bg-card/40 border-border/80"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={cn(
              "text-[10px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded border transition-colors",
              activeFilter === chip
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/80 bg-card/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
        <span className="font-bold text-foreground">{filtered.length}</span> NOTE{filtered.length !== 1 ? "S" : ""}
      </p>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-xs text-muted-foreground/80">
          No notes match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card
                data-slot="card"
                className="h-full cursor-pointer border border-border/80 bg-card/60 rounded-xl transition-all hover:shadow-sm hover:border-primary/30"
              >
                <CardContent className="p-4">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-foreground flex-1">
                      {note.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      {note.pinned && <Pin className="h-3.5 w-3.5 text-[var(--token-amber)]" />}
                      {note.reviewLater && <BookmarkCheck className="h-3.5 w-3.5 text-[var(--token-cyan)]" />}
                      {note.confusing && <AlertCircle className="h-3.5 w-3.5 text-[var(--token-red)]" />}
                    </div>
                  </div>

                  <p className="mb-3 text-xs text-muted-foreground/80 leading-relaxed">
                    {truncate(note.content, 150)}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {note.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 4 && (
                        <span className="text-[9px] font-mono text-muted-foreground/60">
                          +{note.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    <span className="truncate">
                      {note.lesson
                        ? `LESSON · ${truncate(note.lesson.title, 25)}`
                        : note.assignment
                        ? `ASSIGN · ${truncate(note.assignment.title, 20)}`
                        : note.track
                        ? note.track.name.toUpperCase()
                        : "GENERAL"}
                    </span>
                    <span className="shrink-0">{formatDateShort(note.createdAt).toUpperCase()}</span>
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
