"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList, Briefcase, GitFork, Globe, FileCode, Camera, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type PortfolioSubmission = {
  id: string;
  submittedAt: Date;
  status: string;
  repoUrl: string | null;
  deploymentUrl: string | null;
  sqlScriptUrl: string | null;
  screenshotUrl: string | null;
  selfScore: number | null;
  reviewerNotes: string | null;
  assignment: {
    id: string;
    title: string;
    brief: string;
    week: { weekNumber: number };
    track: { name: string; color: string; slug: string } | null;
  };
};

interface AssignmentsTabsProps {
  assignmentsContent: ReactNode;
  portfolioSubmissions: PortfolioSubmission[];
}

export function AssignmentsTabs({ assignmentsContent, portfolioSubmissions }: AssignmentsTabsProps) {
  const [tab, setTab] = useState<"tasks" | "portfolio">("tasks");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border/80 bg-card/40 p-1 w-fit">
        <button
          onClick={() => setTab("tasks")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
            tab === "tasks" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardList className="h-3.5 w-3.5" />ALL TASKS
        </button>
        <button
          onClick={() => setTab("portfolio")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
            tab === "portfolio" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />MY WORK
          {portfolioSubmissions.length > 0 && (
            <span className={cn(
              "ml-0.5 rounded-full px-1.5 py-0 text-[9px] font-mono font-bold",
              tab === "portfolio" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>
              {portfolioSubmissions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tasks panel */}
      {tab === "tasks" && assignmentsContent}

      {/* Portfolio panel */}
      {tab === "portfolio" && (
        portfolioSubmissions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No submitted projects yet"
            description="Submit your first assignment to start building your portfolio."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {portfolioSubmissions.map((sub) => {
              const { assignment } = sub;
              return (
                <Card key={sub.id} data-slot="card" className="border border-border/80 bg-card/60 rounded-xl transition-all hover:shadow-sm hover:border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground tracking-tight leading-snug line-clamp-2">
                        {assignment.title.replace(/^Week \d+ Assignment:\s*/, "")}
                      </h3>
                      <span className="shrink-0 text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
                        W{assignment.week.weekNumber}
                      </span>
                    </div>

                    {assignment.track && (
                      <span
                        className="inline-flex text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border w-fit"
                        style={{ color: assignment.track.color, borderColor: `${assignment.track.color}40`, backgroundColor: `${assignment.track.color}10` }}
                      >
                        {assignment.track.name}
                      </span>
                    )}

                    <p className="text-xs text-muted-foreground/80 line-clamp-2">{assignment.brief}</p>

                    {/* Proof links */}
                    <div className="flex flex-wrap gap-1.5">
                      {sub.repoUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider gap-1 border-border hover:bg-muted">
                          <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer">
                            <GitFork className="w-3 h-3" />GITHUB
                          </a>
                        </Button>
                      )}
                      {sub.deploymentUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider gap-1 text-[var(--token-emerald)] border-[var(--token-emerald)]/30 hover:bg-[var(--token-emerald)]/10">
                          <a href={sub.deploymentUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-3 h-3" />LIVE
                          </a>
                        </Button>
                      )}
                      {sub.sqlScriptUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider gap-1 border-border hover:bg-muted">
                          <a href={sub.sqlScriptUrl} target="_blank" rel="noopener noreferrer">
                            <FileCode className="w-3 h-3" />SQL
                          </a>
                        </Button>
                      )}
                      {sub.screenshotUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider gap-1 border-border hover:bg-muted">
                          <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <Camera className="w-3 h-3" />SHOT
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        {sub.selfScore !== null && (
                          <span className="flex items-center gap-0.5 text-[var(--token-amber)]">
                            <Star className="w-3 h-3 fill-current" />{sub.selfScore}/10
                          </span>
                        )}
                      </span>
                      <span>{formatDate(sub.submittedAt)}</span>
                    </div>

                    <Button size="sm" variant="ghost" className="w-full h-7 text-[10px] font-mono uppercase tracking-wider" asChild>
                      <Link href={`/assignments/${assignment.id}`}>
                        VIEW DETAILS <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
