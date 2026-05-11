"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cn,
  formatDate,
  getDifficultyColor,
  getStatusColor,
  isOverdue,
  isDueSoon,
} from "@/lib/utils";

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

type FilterTab =
  | "All"
  | "Not Started"
  | "In Progress"
  | "Submitted"
  | "Overdue";

const TABS: FilterTab[] = [
  "All",
  "Not Started",
  "In Progress",
  "Submitted",
  "Overdue",
];

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
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} assignment{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Assignment cards */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No assignments in this category.
        </p>
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
                className={cn(
                  "border-border/40 bg-card/60 transition-shadow hover:shadow-md hover:shadow-black/20",
                  overdue && "border-red-400/30"
                )}
              >
                <CardContent className="p-4">
                  {/* Badges */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {a.track && (
                      <Badge variant="outline" className="text-[10px]">
                        {a.track.name}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                        getDifficultyColor(a.difficulty)
                      )}
                    >
                      {a.difficulty}
                    </span>
                    {submitted ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          getStatusColor(sub?.status ?? "submitted")
                        )}
                      >
                        {sub?.status ?? "submitted"}
                      </span>
                    ) : overdue ? (
                      <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                        overdue
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                          getStatusColor(a.status)
                        )}
                      >
                        {a.status}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Week {a.week.weekNumber}
                  </p>

                  {/* Due date */}
                  <p
                    className={cn(
                      "mb-3 flex items-center gap-1.5 text-xs",
                      overdue
                        ? "text-red-400"
                        : soon
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    Due {formatDate(a.dueDate)}
                  </p>

                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={`/assignments/${a.id}`}>
                      View Assignment
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
