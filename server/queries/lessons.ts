import { db } from "@/lib/db";

type LessonRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  estimatedMinutes: number;
  difficulty: string;
  order: number;
  progress: { status: string }[];
};

type ModuleRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  order: number;
  estimatedHours: number;
  prerequisiteModuleIds: string[];
  lessons: LessonRow[];
};

// ── getLessonBySlug ───────────────────────────────────────────────────────────

export async function getLessonBySlug(slug: string, userId: string) {
  return db.lesson.findUnique({
    where: { slug },
    include: {
      module: {
        include: {
          track: true,
        },
      },
      week: true,
      notes: {
        where: { userId },
        orderBy: { createdAt: "desc" },
      },
      checkpointAnswers: {
        where: { userId },
        orderBy: { questionIndex: "asc" },
      },
      progress: {
        where: { userId },
        select: { status: true, completedAt: true },
      },
    },
  });
}

// ── getLessonsForWeek ─────────────────────────────────────────────────────────

export async function getLessonsForWeek(weekId: string) {
  return db.lesson.findMany({
    where: { weekId },
    orderBy: { order: "asc" },
    include: {
      module: {
        select: { id: true, title: true, slug: true },
      },
    },
  });
}

// ── getModulesWithLessons ─────────────────────────────────────────────────────

export async function getModulesWithLessons(trackSlug: string, userId: string) {
  const track = await db.track.findUnique({
    where: { slug: trackSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { userId },
                select: { status: true },
              },
            },
          },
        },
      },
    },
  });

  if (!track) return null;

  // Enrich each module with progress counts
  const modulesWithCounts = (track.modules as ModuleRow[]).map((mod) => {
    const total = mod.lessons.length;
    const completed = mod.lessons.filter(
      (l: { status: string }) => l.status === "completed"
    ).length;
    const inProgress = mod.lessons.filter(
      (l: { status: string }) => l.status === "in-progress"
    ).length;

    return {
      ...mod,
      lessonCount: total,
      completedCount: completed,
      inProgressCount: inProgress,
      progressPercent:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  return {
    ...track,
    modules: modulesWithCounts,
  };
}
