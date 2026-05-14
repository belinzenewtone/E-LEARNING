import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAssignments, getOverdueAssignments } from "@/server/queries/assignments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AssignmentsClient } from "./assignments-client";
import { Topbar } from "@/components/layout/topbar";

// ── page ──────────────────────────────────────────────────────────────────────

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [assignments, overdue] = await Promise.all([
    getAssignments(userId),
    getOverdueAssignments(userId),
  ]);

  const total = assignments.length;
  const submitted = assignments.filter((a) => a.submissions.length > 0).length;
  const overdueCount = overdue.length;

  if (assignments.length === 0) {
    return (
      <div>
        <Topbar title="Assignments" subtitle="All assignments across both tracks" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
            <p className="text-sm text-muted-foreground">
              All assignments across both tracks.
            </p>
          </div>
          <EmptyState
            icon={FileText}
            title="No assignments yet"
            description="Assignments will appear here once the curriculum is loaded."
            action={{ label: "View Weeks", href: "/weeks" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Assignments" subtitle="All assignments across both tracks" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            All assignments across both tracks.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{total}</span>
            <span className="text-muted-foreground">total</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--token-emerald)]" />
            <span className="font-semibold text-[var(--token-emerald)]">{submitted}</span>
            <span className="text-[var(--token-emerald)]/70">submitted</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-sm">
              <AlertCircle className="h-3.5 w-3.5 text-[var(--token-red)]" />
              <span className="font-semibold text-[var(--token-red)]">{overdueCount}</span>
              <span className="text-[var(--token-red)]/70">overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Client-side filtered list */}
      <AssignmentsClient assignments={assignments} />
      </div>
    </div>
  );
}
