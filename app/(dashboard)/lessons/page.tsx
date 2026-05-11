import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LessonsClient } from "./lessons-client";
import { LessonsPageSkeleton } from "./loading";

// ── types ─────────────────────────────────────────────────────────────────────

type LessonWithMeta = {
  id: string;
  title: string;
  slug: string;
  sourceName: string;
  estimatedMinutes: number;
  difficulty: string;
  status: string;
  weekId: string;
  module: {
    id: string;
    title: string;
    track: { name: string; slug: string; color: string };
  };
  week: { id: string; weekNumber: number; theme: string; title: string };
};

type WeekGroup = {
  weekId: string;
  weekNumber: number;
  weekTitle: string;
  theme: string;
  lessons: LessonWithMeta[];
};

// ── data fetching ──────────────────────────────────────────────────────────────

async function getAllLessonsGrouped(): Promise<WeekGroup[]> {
  const lessons = await db.lesson.findMany({
    orderBy: [{ week: { weekNumber: "asc" } }, { order: "asc" }],
    include: {
      module: {
        include: { track: { select: { name: true, slug: true, color: true } } },
      },
      week: {
        select: {
          id: true,
          weekNumber: true,
          theme: true,
          title: true,
        },
      },
    },
  });

  const map = new Map<string, WeekGroup>();

  for (const lesson of lessons) {
    const key = lesson.weekId;
    if (!map.has(key)) {
      map.set(key, {
        weekId: lesson.week.id,
        weekNumber: lesson.week.weekNumber,
        weekTitle: lesson.week.title,
        theme: lesson.week.theme,
        lessons: [],
      });
    }
    map.get(key)!.lessons.push(lesson as LessonWithMeta);
  }

  return Array.from(map.values()).sort((a, b) => a.weekNumber - b.weekNumber);
}

// ── sub-components ────────────────────────────────────────────────────────────

async function LessonsContent() {
  const weekGroups = await getAllLessonsGrouped();

  if (weekGroups.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No lessons yet"
        description="Lessons will appear here once the curriculum is loaded."
        action={{ label: "View Roadmap", href: "/roadmap" }}
      />
    );
  }

  return <LessonsClient weekGroups={weekGroups} />;
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function LessonsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          All Lessons
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse every lesson in the curriculum, grouped by week.
        </p>
      </div>

      <Suspense fallback={<LessonsPageSkeleton />}>
        <LessonsContent />
      </Suspense>
    </div>
  );
}
