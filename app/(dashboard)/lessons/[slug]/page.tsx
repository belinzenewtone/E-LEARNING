import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Tag,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonSkeleton } from "@/components/shared/loading-skeleton";
import { cn, minutesToHours, getDifficultyColor, getStatusColor } from "@/lib/utils";
import { LessonStudyArea } from "./lesson-study-area";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StudyTimer } from "@/components/shared/study-timer";
import { MarkdownContent } from "@/components/shared/markdown-content";

// ── Prisma result type ────────────────────────────────────────────────────────

type LessonFull = NonNullable<Awaited<ReturnType<typeof getLessonData>>>;

// ── data fetch ────────────────────────────────────────────────────────────────

async function getLessonData(slug: string, userId: string) {
  return db.lesson.findUnique({
    where: { slug },
    include: {
      module: { include: { track: true } },
      week: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, slug: true, order: true },
          },
          assignments: {
            select: { id: true, title: true },
            take: 1,
          },
        },
      },
      notes: { where: { userId }, orderBy: { createdAt: "desc" } },
      checkpointAnswers: { where: { userId }, orderBy: { questionIndex: "asc" } },
      progress: {
        where: { userId },
        select: { status: true, completedAt: true },
      },
    },
  });
}

// ── progress sidebar ──────────────────────────────────────────────────────────

function ProgressSidebar({ lesson }: { lesson: LessonFull }) {
  const status = lesson.progress[0]?.status ?? "not-started";
  const weekLessons = lesson.week.lessons;
  const currentIndex = weekLessons.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = currentIndex >= 0 ? weekLessons[currentIndex + 1] : undefined;
  const completedInWeek = weekLessons.filter((_, i) => i < currentIndex).length;
  const weekProgress =
    weekLessons.length > 0
      ? Math.round((completedInWeek / weekLessons.length) * 100)
      : 0;
  const currentAssignment = lesson.week.assignments[0];

  return (
    <div className="space-y-4">
      {/* Study Timer */}
      <StudyTimer />

      {/* Status card */}
      <Card className="border-border/40 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Lesson Status</CardTitle>
        </CardHeader>
        <CardContent>
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              getStatusColor(status)
            )}
          >
            {status.replace("-", " ")}
          </span>
        </CardContent>
      </Card>

      {/* Week progress */}
      <Card className="border-border/40 bg-card/60">
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Week {lesson.week.weekNumber} Progress
          </p>
          <div className="flex items-center gap-3">
            <ProgressRing value={weekProgress} size={56} color="var(--token-cyan)" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {completedInWeek}/{weekLessons.length} lessons
              </p>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment link */}
      {currentAssignment && (
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Week Assignment
            </p>
            <p className="mb-3 text-sm font-medium text-foreground line-clamp-2">
              {currentAssignment.title}
            </p>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={`/assignments/${currentAssignment.id}`}>
                View Assignment
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next lesson */}
      {nextLesson && (
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Next Lesson
            </p>
            <p className="mb-3 text-sm font-medium text-foreground line-clamp-2">
              {nextLesson.title}
            </p>
            <Button size="sm" variant="default" className="w-full" asChild>
              <Link href={`/lessons/${nextLesson.slug}`}>
                Next
                <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── left info panel ───────────────────────────────────────────────────────────

function LessonInfoPanel({ lesson }: { lesson: LessonFull }) {
  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                getDifficultyColor(lesson.difficulty)
              )}
            >
              {lesson.difficulty}
            </span>
            <Badge variant="outline" className="text-xs">
              {lesson.module.track.name}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-lg leading-snug">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Objective */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Objective
            </p>
            <p className="text-sm text-foreground leading-relaxed">{lesson.objective}</p>
          </div>

          <Separator />

          {/* Source */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Source
              </p>
              <p className="mt-0.5 text-sm text-foreground">{lesson.sourceName}</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {minutesToHours(lesson.estimatedMinutes)} estimated
            </span>
          </div>

          {/* Key concepts */}
          {lesson.keyConcepts.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  Key Concepts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.keyConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground border border-border/40"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Related assignment */}
          {lesson.week.assignments.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Related Assignment
                </p>
                <Link
                  href={`/assignments/${lesson.week.assignments[0].id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {lesson.week.assignments[0].title}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

async function LessonContent({ slug, userId }: { slug: string; userId: string }) {
  const lesson = await getLessonData(slug, userId);
  if (!lesson) notFound();

  const checkpointQuestions = lesson.checkpointQuestions as { question: string }[];

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/lessons" className="hover:text-foreground transition-colors">
          Lessons
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[240px]">{lesson.title}</span>
      </nav>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_220px]">
        <aside>
          <LessonInfoPanel lesson={lesson} />
        </aside>

        <main className="space-y-5">
          {lesson.content && (
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <MarkdownContent content={lesson.content} />
              </CardContent>
            </Card>
          )}
          <LessonStudyArea
            lessonId={lesson.id}
            lessonSlug={lesson.slug}
            userId={userId}
            checkpointQuestions={checkpointQuestions}
            existingNotes={lesson.notes}
            existingAnswers={lesson.checkpointAnswers}
            isCompleted={lesson.progress[0]?.status === "completed"}
          />
        </main>

        <aside>
          <ProgressSidebar lesson={lesson} />
        </aside>
      </div>
    </div>
  );
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<LessonSkeleton />}>
        <LessonContent slug={slug} userId={session.user.id} />
      </Suspense>
    </div>
  );
}
