import { db } from "@/lib/db";

export async function getWeeksList() {
  return db.weekSprint.findMany({
    orderBy: { weekNumber: "asc" },
    select: {
      id: true,
      weekNumber: true,
      title: true,
      theme: true,
      phase: true,
      status: true,
      startDate: true,
      endDate: true,
      estimatedHours: true,
      retrospectiveCompleted: true,
      goals: true,
      _count: {
        select: { lessons: true, assignments: true },
      },
    },
  });
}

export async function getWeekByNumber(weekNumber: number, userId: string) {
  return db.weekSprint.findUnique({
    where: { weekNumber },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          module: { select: { title: true, slug: true } },
          progress: {
            where: { userId },
            select: { status: true },
          },
        },
      },
      assignments: {
        include: {
          track: { select: { name: true, slug: true, color: true } },
          submissions: {
            where: { userId },
            select: { id: true, status: true, submittedAt: true },
            take: 1,
          },
        },
      },
    },
  });
}

export async function getActiveWeek() {
  return db.weekSprint.findFirst({
    where: { status: "active" },
    orderBy: { weekNumber: "asc" },
  });
}
