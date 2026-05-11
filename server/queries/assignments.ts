import { db } from "@/lib/db";

// ── getAssignments ────────────────────────────────────────────────────────────

export async function getAssignments(userId: string) {
  return db.assignment.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
      submissions: {
        where: { userId },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          selfScore: true,
          repoUrl: true,
          deploymentUrl: true,
          reflection: true,
        },
      },
    },
  });
}

// ── getAssignmentById ─────────────────────────────────────────────────────────

export async function getAssignmentById(id: string, userId: string) {
  return db.assignment.findUnique({
    where: { id },
    include: {
      week: true,
      track: true,
      notes: {
        where: { userId },
        orderBy: { createdAt: "desc" },
      },
      submissions: {
        where: { userId },
        orderBy: { submittedAt: "desc" },
        take: 1,
      },
    },
  });
}

// ── getOverdueAssignments ─────────────────────────────────────────────────────

export async function getOverdueAssignments(userId: string) {
  return db.assignment.findMany({
    where: {
      dueDate: { lt: new Date() },
      submissions: {
        none: {
          userId,
          status: { in: ["submitted", "approved", "reviewed"] },
        },
      },
    },
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
    },
  });
}
