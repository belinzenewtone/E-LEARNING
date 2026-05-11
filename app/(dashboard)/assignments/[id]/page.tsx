import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  CheckSquare,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { getAssignmentById } from "@/server/queries/assignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AssignmentSkeleton } from "@/components/shared/loading-skeleton";
import {
  cn,
  formatDate,
  formatDateTime,
  getDifficultyColor,
  getStatusColor,
  isOverdue,
} from "@/lib/utils";
import { SubmissionForm } from "./submission-form";

// ── types ──────────────────────────────────────────────────────────────────────

type RubricItem = { criterion: string; description: string; maxPoints: number };
type Deliverable = { label: string; description?: string };

// ── countdown ─────────────────────────────────────────────────────────────────

function DueDateBadge({ dueDate }: { dueDate: Date }) {
  const now = new Date();
  const diff = Math.ceil(
    (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const overdue = isOverdue(dueDate);

  if (overdue) {
    return (
      <span className="text-red-400 text-sm font-medium">
        Overdue by {Math.abs(diff)} day{Math.abs(diff) !== 1 ? "s" : ""}
      </span>
    );
  }

  if (diff <= 3) {
    return (
      <span className="text-amber-400 text-sm font-medium">
        Due in {diff} day{diff !== 1 ? "s" : ""} ({formatDate(dueDate)})
      </span>
    );
  }

  return (
    <span className="text-muted-foreground text-sm">
      Due {formatDate(dueDate)}
    </span>
  );
}

// ── page content ──────────────────────────────────────────────────────────────

async function AssignmentContent({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const assignment = await getAssignmentById(id, userId);
  if (!assignment) notFound();

  const rubric = assignment.rubric as RubricItem[];
  const deliverables = assignment.requiredDeliverables as Deliverable[];
  const submission = assignment.submissions[0] ?? null;
  const alreadySubmitted = !!submission;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {assignment.track && (
            <Badge variant="outline">{assignment.track.name}</Badge>
          )}
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              getDifficultyColor(assignment.difficulty)
            )}
          >
            {assignment.difficulty}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              getStatusColor(assignment.status)
            )}
          >
            {assignment.status}
          </span>
          <Badge variant="outline">
            Week {assignment.week.weekNumber}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          {assignment.title}
        </h1>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DueDateBadge dueDate={assignment.dueDate} />
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {assignment.xpReward} XP reward
          </span>
        </div>
      </div>

      <Separator />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: brief + rubric + deliverables + notes */}
        <div className="space-y-5">
          {/* Brief */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                Assignment Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {assignment.brief}
              </p>
            </CardContent>
          </Card>

          {/* Rubric */}
          {rubric.length > 0 && (
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Grading Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Criterion
                        </th>
                        <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Description
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Points
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {rubric.map((item, i) => (
                        <tr key={i}>
                          <td className="py-2.5 pr-4 font-medium text-foreground align-top">
                            {item.criterion}
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground align-top">
                            {item.description}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-foreground align-top">
                            {item.maxPoints}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border/40">
                        <td
                          colSpan={2}
                          className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          Total
                        </td>
                        <td className="pt-2 text-right font-bold text-foreground">
                          {rubric.reduce((s, r) => s + r.maxPoints, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Required deliverables */}
          {deliverables.length > 0 && (
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  Required Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/50">
                        <span className="text-[10px] text-muted-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          {d.label}
                        </span>
                        {d.description && (
                          <p className="text-xs text-muted-foreground">
                            {d.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Notes on this assignment */}
          {assignment.notes.length > 0 && (
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  Related Notes ({assignment.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignment.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-border/40 bg-muted/20 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {note.title}
                      </p>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/notes/${note.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: submission form or existing submission */}
        <div>
          {alreadySubmitted ? (
            <Card className="border-emerald-400/20 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-emerald-400">
                  Submitted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDateTime(submission.submittedAt)}
                </p>
                {submission.repoUrl && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Repository
                    </p>
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {submission.repoUrl}
                    </a>
                  </div>
                )}
                {submission.deploymentUrl && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Live Demo
                    </p>
                    <a
                      href={submission.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {submission.deploymentUrl}
                    </a>
                  </div>
                )}
                {submission.sqlScriptUrl && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      SQL Script
                    </p>
                    <a
                      href={submission.sqlScriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {submission.sqlScriptUrl}
                    </a>
                  </div>
                )}
                {submission.screenshotUrl && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Screenshot
                    </p>
                    <a
                      href={submission.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {submission.screenshotUrl}
                    </a>
                  </div>
                )}
                {submission.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Notes
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {submission.notes}
                    </p>
                  </div>
                )}
                {submission.reflection && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Reflection
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {submission.reflection}
                    </p>
                  </div>
                )}
                {submission.selfScore !== null && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Self Score
                    </p>
                    <p className="font-semibold text-foreground">
                      {submission.selfScore}/10
                    </p>
                  </div>
                )}
                <div
                  className={cn(
                    "mt-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize",
                    getStatusColor(submission.status)
                  )}
                >
                  Status: {submission.status}
                </div>
              </CardContent>
            </Card>
          ) : (
            <SubmissionForm assignmentId={assignment.id} />
          )}
        </div>
      </div>
    </div>
  );
}

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/assignments" className="hover:text-foreground transition-colors">
          Assignments
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Detail</span>
      </nav>

      <Suspense fallback={<AssignmentSkeleton />}>
        <AssignmentContent id={id} userId={session.user.id} />
      </Suspense>
    </div>
  );
}
