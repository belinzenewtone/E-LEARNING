import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  FileText,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate, getDifficultyColor, getStatusColor, minutesToHours } from "@/lib/utils";
import { RetroForm } from "./retro-form";
import { getWeekByNumber } from "@/server/queries/weeks";

interface WeekDetailPageProps {
  params: Promise<{ weekNumber: string }>;
}

export default async function WeekDetailPage({ params }: WeekDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const { weekNumber: weekNumberRaw } = await params;
  const weekNumber = parseInt(weekNumberRaw, 10);
  if (isNaN(weekNumber)) notFound();

  const week = await getWeekByNumber(weekNumber, userId);
  if (!week) notFound();

  const canRetro = week.status === "active" || week.status === "completed";

  const lessonsCompleted = week.lessons.filter(
    (l) => l.progress[0]?.status === "completed" || l.status === "completed"
  ).length;
  const weekProgress = week.lessons.length > 0
    ? Math.round((lessonsCompleted / week.lessons.length) * 100)
    : 0;

  const phaseColors: Record<number, string> = {
    1: "text-[var(--token-cyan)] bg-[var(--token-cyan)]/10 border-[var(--token-cyan)]/30",
    2: "text-[var(--token-blue)] bg-[var(--token-blue)]/10 border-[var(--token-blue)]/30",
    3: "text-[var(--token-purple)] bg-[var(--token-purple)]/10 border-[var(--token-purple)]/30",
    4: "text-[var(--token-amber)] bg-[var(--token-amber)]/10 border-[var(--token-amber)]/30",
    5: "text-[var(--token-emerald)] bg-[var(--token-emerald)]/10 border-[var(--token-emerald)]/30",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/weeks" className="hover:text-foreground transition-colors">
          Weekly Sprints
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Week {week.weekNumber}</span>
      </nav>

      {/* Sprint header */}
      <div className="rounded-xl border border-border/50 bg-card/60 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                W{week.weekNumber}
              </div>
              <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", getStatusColor(week.status))}>
                {week.status}
              </span>
              <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", phaseColors[week.phase] ?? "text-muted-foreground")}>
                Phase {week.phase}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">{week.title}</h1>
            <p className="text-sm italic text-muted-foreground">{week.theme}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(week.startDate)} — {formatDate(week.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {week.estimatedHours}h estimated
              </span>
            </div>
          </div>

          {/* Week progress ring */}
          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
                <circle
                  cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - weekProgress / 100)}`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <span className="absolute text-sm font-bold text-foreground">{weekProgress}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {lessonsCompleted}/{week.lessons.length} done
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={weekProgress} className="mt-4 h-1.5" />
      </div>

      {/* Goals */}
      {week.goals.length > 0 && (
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              Sprint Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {week.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                  <span className="text-foreground">{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lessons + Assignments */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Lessons */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Lessons
            <span className="ml-auto text-xs text-muted-foreground">
              {lessonsCompleted}/{week.lessons.length} completed
            </span>
          </h2>

          {week.lessons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/40 p-6 text-center text-sm text-muted-foreground">
              No lessons for this week yet.
            </p>
          ) : (
            <div className="space-y-2">
              {week.lessons.map((lesson) => {
                const lessonStatus = lesson.progress[0]?.status ?? lesson.status;
                const isDone = lessonStatus === "completed";
                return (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.slug}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-all duration-150 hover:bg-muted/20",
                      isDone
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-border/40 bg-card/40 hover:border-primary/30"
                    )}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--token-emerald)]" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-medium", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                        {lesson.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lesson.module.title}</span>
                        <span>·</span>
                        <span>{minutesToHours(lesson.estimatedMinutes)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize sm:inline-flex", getStatusColor(lessonStatus))}>
                        {lessonStatus}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignments */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-[var(--token-amber)]" />
            Assignments ({week.assignments.length})
          </h2>

          {week.assignments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/40 p-6 text-center text-sm text-muted-foreground">
              No assignments for this week yet.
            </p>
          ) : (
            <div className="space-y-3">
              {week.assignments.map((assignment) => {
                const submitted = assignment.submissions.length > 0;
                const sub = assignment.submissions[0];
                return (
                  <Card key={assignment.id} className={cn("border-border/40", submitted && "border-emerald-500/20 bg-emerald-500/5")}>
                    <CardContent className="p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {assignment.track && (
                          <Badge variant="outline" className="text-[10px]">
                            {assignment.track.name}
                          </Badge>
                        )}
                        <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize", getDifficultyColor(assignment.difficulty))}>
                          {assignment.difficulty}
                        </span>
                        {submitted && (
                          <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", getStatusColor(sub?.status ?? "submitted"))}>
                            {sub?.status ?? "submitted"}
                          </span>
                        )}
                      </div>

                      <h3 className="mb-1 text-sm font-semibold text-foreground">{assignment.title}</h3>
                      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{assignment.brief}</p>

                      <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {formatDate(assignment.dueDate)}
                      </div>

                      <Button size="sm" variant={submitted ? "outline" : "default"} className="w-full" asChild>
                        <Link href={`/assignments/${assignment.id}`}>
                          {submitted ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 text-[var(--token-emerald)]" /> View Submission</>
                          ) : (
                            <>Start Assignment <ArrowRight className="h-3.5 w-3.5" /></>
                          )}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Retrospective */}
      {canRetro && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-[var(--token-amber)]" />
              Weekly Retrospective
              {week.retrospectiveCompleted && (
                <Badge variant="success" className="ml-auto">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              )}
            </h2>
            <RetroForm
              weekId={week.id}
              existingNotes={week.retrospectiveNotes ?? ""}
              isCompleted={week.retrospectiveCompleted}
            />
          </section>
        </>
      )}
    </div>
  );
}
