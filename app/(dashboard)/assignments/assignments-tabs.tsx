"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        <button
          onClick={() => setTab("tasks")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "tasks" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardList className="h-3.5 w-3.5" />All Tasks
        </button>
        <button
          onClick={() => setTab("portfolio")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "portfolio" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />My Work
          {portfolioSubmissions.length > 0 && (
            <span className={cn(
              "ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold",
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
                <Card key={sub.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-snug">
                        {assignment.title.replace(/^Week \d+ Assignment:\s*/, "")}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Wk {assignment.week.weekNumber}
                      </Badge>
                    </div>
                    {assignment.track && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold w-fit"
                        style={{ color: assignment.track.color, borderColor: `${assignment.track.color}40` }}>
                        {assignment.track.name}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{assignment.brief}</p>

                    {/* Proof links */}
                    <div className="flex flex-wrap gap-1.5">
                      {sub.repoUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                          <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer">
                            <GitFork className="w-3 h-3" />GitHub
                          </a>
                        </Button>
                      )}
                      {sub.deploymentUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 text-[var(--token-emerald)] border-[var(--token-emerald)]/30">
                          <a href={sub.deploymentUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-3 h-3" />Live
                          </a>
                        </Button>
                      )}
                      {sub.sqlScriptUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                          <a href={sub.sqlScriptUrl} target="_blank" rel="noopener noreferrer">
                            <FileCode className="w-3 h-3" />SQL
                          </a>
                        </Button>
                      )}
                      {sub.screenshotUrl && (
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                          <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <Camera className="w-3 h-3" />Screenshot
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {sub.selfScore !== null && (
                          <span className="flex items-center gap-0.5 text-[var(--token-amber)]">
                            <Star className="w-3 h-3 fill-current" />{sub.selfScore}/10
                          </span>
                        )}
                      </span>
                      <span>{formatDate(sub.submittedAt)}</span>
                    </div>

                    <Button size="sm" variant="ghost" className="w-full h-7 text-xs" asChild>
                      <Link href={`/assignments/${assignment.id}`}>
                        View details <ChevronRight className="h-3 w-3 ml-0.5" />
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
