"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isOverdue, isDueSoon } from "@/lib/utils";

type Submission = {
  id: string;
  status: string;
  submittedAt: Date;
  selfScore: number | null;
  repoUrl: string | null;
  deploymentUrl: string | null;
  reflection: string | null;
};

type Assignment = {
  id: string;
  title: string;
  difficulty: string;
  dueDate: Date;
  status: string;
  week: { weekNumber: number; title: string };
  track: { name: string; slug: string; color: string } | null;
  submissions: Submission[];
};

type FilterTab = "All" | "Not Started" | "In Progress" | "Submitted" | "Overdue";

const TABS: FilterTab[] = ["All", "Not Started", "In Progress", "Submitted", "Overdue"];

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
    case "approved":
      return "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20";
    case "in-progress":
    case "submitted":
    case "reviewed":
      return "bg-[var(--token-cyan)]/10 text-[var(--token-cyan)] border-[var(--token-cyan)]/20";
    default:
      return "bg-muted/40 text-muted-foreground border-border";
  }
}

interface AssignmentsClientProps {
  assignments: Assignment[];
}

export function AssignmentsClient({ assignments }: AssignmentsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const submitted = a.submissions.length > 0;
      const overdue = isOverdue(a.dueDate) && !submitted;
      switch (activeTab) {
        case "All":
          return true;
        case "Not Started":
          return !submitted && !overdue && a.status === "not-started";
        case "In Progress":
          return !submitted && !overdue && a.status === "in-progress";
        case "Submitted":
          return submitted;
        case "Overdue":
          return overdue;
        default:
          return true;
      }
    });
  }, [assignments, activeTab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border/80 bg-card/40 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
        <span className="font-bold text-foreground">{filtered.length}</span> ASSIGNMENT{filtered.length !== 1 ? "S" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-xs text-muted-foreground/80">No assignments in this category.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const submitted = a.submissions.length > 0;
            const sub = a.submissions[0];
            const overdue = isOverdue(a.dueDate) && !submitted;
            const soon = isDueSoon(a.dueDate) && !submitted && !overdue;

            return (
              <Card
                key={a.id}
                data-slot="card"
                className={cn(
                  "border border-border/80 bg-card/60 rounded-xl transition-all hover:shadow-sm",
                  overdue && "border-l-2 border-l-[var(--token-red)]",
                  submitted && "border-l-2 border-l-[var(--token-emerald)]"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {a.track && (
                      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
                        {a.track.name}
                      </span>
                    )}
                    <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", difficultyClasses(a.difficulty))}>
                      {a.difficulty}
                    </span>
                    {submitted ? (
                      <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", statusClasses(sub?.status ?? "submitted"))}>
                        {sub?.status ?? "submitted"}
                      </span>
                    ) : overdue ? (
                      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-[var(--token-red)]/10 text-[var(--token-red)] border-[var(--token-red)]/20">
                        OVERDUE
                      </span>
                    ) : (
                      <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", statusClasses(a.status))}>
                        {a.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-foreground line-clamp-2">{a.title}</h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                      WEEK {a.week.weekNumber}
                    </p>
                  </div>

                  <p className={cn(
                    "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider",
                    overdue ? "text-[var(--token-red)]" : soon ? "text-[var(--token-amber)]" : "text-muted-foreground/80"
                  )}>
                    <Calendar className="h-3 w-3" />
                    DUE {formatDate(a.dueDate).toUpperCase()}
                  </p>

                  <Button size="sm" variant="outline" className="w-full border-border hover:bg-muted text-[10px] font-mono uppercase tracking-wider" asChild>
                    <Link href={`/assignments/${a.id}`}>
                      VIEW ASSIGNMENT
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
