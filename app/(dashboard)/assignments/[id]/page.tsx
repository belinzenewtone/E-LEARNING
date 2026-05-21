import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  BookOpen,
  ExternalLink,
  Link2,
  Image as ImageIcon,
  MessageSquare,
  Star,
  CheckCircle2,
} from "lucide-react";
import { getAssignmentById } from "@/server/queries/assignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignmentSkeleton } from "@/components/shared/loading-skeleton";
import { cn, formatDate, formatDateTime, isOverdue } from "@/lib/utils";
import { SubmissionForm } from "./submission-form";
import { ReviewForm } from "./review-form";
import { Topbar } from "@/components/layout/topbar";

// ── types ──────────────────────────────────────────────────────────────────────

type RubricItem = { criterion: string; description: string; maxPoints: number };
type Deliverable = { label: string; description?: string };

// ── helpers ──────────────────────────────────────────────────────────────────

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
    case "overdue":
      return "bg-[var(--token-red)]/10 text-[var(--token-red)] border-[var(--token-red)]/20";
    default:
      return "bg-muted/40 text-muted-foreground border-border";
  }
}

function DueDateBadge({ dueDate }: { dueDate: Date }) {
  const now = new Date();
  const diff = Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = isOverdue(dueDate);

  if (overdue) {
    return (
      <span className="text-[var(--token-red)] text-xs font-mono uppercase tracking-wider font-semibold">
        OVERDUE BY {Math.abs(diff)} DAY{Math.abs(diff) !== 1 ? "S" : ""}
      </span>
    );
  }

  if (diff <= 3) {
    return (
      <span className="text-[var(--token-amber)] text-xs font-mono uppercase tracking-wider font-semibold">
        DUE IN {diff} DAY{diff !== 1 ? "S" : ""} ({formatDate(dueDate).toUpperCase()})
      </span>
    );
  }

  return (
    <span className="text-muted-foreground/80 text-xs font-mono uppercase tracking-wider">
      DUE {formatDate(dueDate).toUpperCase()}
    </span>
  );
}

// ── page content ──────────────────────────────────────────────────────────────

async function AssignmentContent({ id, userId }: { id: string; userId: string }) {
  const assignment = await getAssignmentById(id, userId);
  if (!assignment) notFound();

  const rubric = assignment.rubric as RubricItem[];
  const deliverables = assignment.requiredDeliverables as Deliverable[];
  const submission = assignment.submissions[0] ?? null;
  const alreadySubmitted = !!submission;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM // ASSIGNMENT DETAIL
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {assignment.track && (
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
                {assignment.track.name}
              </span>
            )}
            <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", difficultyClasses(assignment.difficulty))}>
              {assignment.difficulty}
            </span>
            <span className={cn("text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border", statusClasses(assignment.status))}>
              {assignment.status}
            </span>
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border">
              WEEK {assignment.week.weekNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground/80">
              <Calendar className="h-3.5 w-3.5" />
              <DueDateBadge dueDate={assignment.dueDate} />
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--token-amber)] font-semibold">
              +{assignment.xpReward} XP REWARD
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: brief + rubric + deliverables + notes */}
        <div className="space-y-5">
          {/* Brief */}
          <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                <FileText className="h-4 w-4 text-primary" />
                ASSIGNMENT BRIEF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{assignment.brief}</p>
            </CardContent>
          </Card>

          {/* Rubric */}
          {rubric.length > 0 && (
            <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                  GRADING RUBRIC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="pb-2 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">CRITERION</th>
                        <th className="pb-2 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">DESCRIPTION</th>
                        <th className="pb-2 text-right text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">POINTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {rubric.map((item, i) => (
                        <tr key={i}>
                          <td className="py-2.5 pr-4 text-xs font-semibold text-foreground align-top">{item.criterion}</td>
                          <td className="py-2.5 pr-4 text-xs text-muted-foreground/80 align-top">{item.description}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-foreground align-top">{item.maxPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border/40">
                        <td colSpan={2} className="pt-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">TOTAL</td>
                        <td className="pt-2 text-right font-mono font-bold text-foreground">
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
            <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                  <CheckSquare className="h-4 w-4 text-[var(--token-emerald)]" />
                  REQUIRED DELIVERABLES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-muted/40">
                        <span className="text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">{d.label}</span>
                        {d.description && <p className="text-xs text-muted-foreground/80">{d.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Notes on this assignment */}
          {assignment.notes.length > 0 && (
            <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                  <BookOpen className="h-4 w-4 text-[var(--token-cyan)]" />
                  RELATED NOTES ({assignment.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignment.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{note.title}</p>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/notes/${note.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: submission form or existing submission */}
        <div>
          {alreadySubmitted ? (
            <div className="space-y-4">
              <Card data-slot="card" className="border border-[var(--token-emerald)]/25 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-emerald)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--token-emerald)]">
                    <CheckCircle2 className="h-4 w-4" />
                    SUBMITTED
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(submission.submittedAt).toUpperCase()}
                  </p>

                  {(submission.repoUrl || submission.deploymentUrl || submission.sqlScriptUrl) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">LINKS</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.repoUrl && (
                          <Button size="sm" variant="outline" asChild className="gap-1.5 border-border hover:bg-muted text-[10px] font-mono uppercase tracking-wider">
                            <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                              <Link2 className="h-3.5 w-3.5" /> REPO
                            </a>
                          </Button>
                        )}
                        {submission.deploymentUrl && (
                          <Button size="sm" variant="outline" asChild className="gap-1.5 border-border hover:bg-muted text-[10px] font-mono uppercase tracking-wider">
                            <a href={submission.deploymentUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" /> LIVE
                            </a>
                          </Button>
                        )}
                        {submission.sqlScriptUrl && (
                          <Button size="sm" variant="outline" asChild className="gap-1.5 border-border hover:bg-muted text-[10px] font-mono uppercase tracking-wider">
                            <a href={submission.sqlScriptUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3.5 w-3.5" /> SQL
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {submission.screenshotUrl && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> SCREENSHOT
                      </p>
                      <a
                        href={submission.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-border/60 overflow-hidden hover:border-primary/40 transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={submission.screenshotUrl} alt="Assignment screenshot" className="w-full h-auto object-cover" loading="lazy" />
                      </a>
                    </div>
                  )}

                  {submission.selfScore !== null && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                      <Star className="h-4 w-4 text-[var(--token-amber)]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">SELF SCORE</span>
                      <span className="ml-auto font-mono font-bold text-foreground">{submission.selfScore}/10</span>
                    </div>
                  )}

                  <div className={cn(
                    "rounded-lg border px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-center",
                    statusClasses(submission.status)
                  )}>
                    STATUS // {submission.status}
                  </div>
                </CardContent>
              </Card>

              {submission.notes && (
                <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">
                      <MessageSquare className="h-3.5 w-3.5" /> NOTES
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{submission.notes}</p>
                  </CardContent>
                </Card>
              )}

              {submission.reflection && (
                <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">
                      <BookOpen className="h-3.5 w-3.5" /> REFLECTION
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{submission.reflection}</p>
                  </CardContent>
                </Card>
              )}

              {(submission as { reviewerNotes?: string | null }).reviewerNotes && (
                <Card data-slot="card" className="border border-[var(--token-cyan)]/25 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-cyan)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--token-cyan)]">
                      <Star className="h-3.5 w-3.5" /> REVIEW NOTES
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {(submission as { reviewerNotes?: string | null }).reviewerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              <ReviewForm
                submissionId={submission.id}
                currentStatus={submission.status}
                currentReviewerNotes={(submission as { reviewerNotes?: string | null }).reviewerNotes ?? null}
              />
            </div>
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

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  return (
    <div>
      <Topbar breadcrumbs={[{ label: "Assignments", href: "/assignments" }, { label: "Detail" }]} />
      <div className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<AssignmentSkeleton />}>
          <AssignmentContent id={id} userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
