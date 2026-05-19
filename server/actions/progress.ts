"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sm2, isDue } from "@/lib/spaced-repetition";

// ── auth guard ────────────────────────────────────────────────────────────────

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

// ── input schemas (Zod v4) ────────────────────────────────────────────────────

const StudyLogSchema = z.object({
  minutes: z.coerce.number().int().min(1, "Minutes must be at least 1").max(1440, "Max 1440 minutes per session"),
  date: z.string().optional(),
  trackId: z.string().optional(),
  mood: z.enum(["great", "good", "okay", "tired", "frustrated"]).optional(),
  energy: z.coerce.number().int().min(1).max(5).optional(),
  learned: z.string().max(2000).optional(),
  blockers: z.string().max(1000).optional(),
  nextStep: z.string().max(500).optional(),
});

const NoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(10000),
  lessonId: z.string().optional(),
  assignmentId: z.string().optional(),
  weekId: z.string().optional(),
  trackId: z.string().optional(),
  tags: z.string().optional(),
  pinned: z.string().optional(),
  reviewLater: z.string().optional(),
});

const AssignmentSubmitSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  deploymentUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  screenshotUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sqlScriptUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  reflection: z.string().max(5000).optional(),
  selfScore: z.coerce.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
});

// ── completeLesson ────────────────────────────────────────────────────────────

export async function completeLesson(lessonId: string, timeSpentMinutes?: number) {
  const userId = await requireUserId();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, weekId: true, moduleId: true },
  });
  if (!lesson) return { success: false, error: "Lesson not found" };

  const already = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (already?.status === "completed") return { success: true, alreadyCompleted: true };

  const now = new Date();
  const clampedTime =
    timeSpentMinutes != null ? Math.min(Math.max(1, timeSpentMinutes), 480) : null;

  await db.$transaction(async (tx) => {
    // Upsert lesson progress — store actual time spent
    await tx.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: "completed", completedAt: now, timeSpentMinutes: clampedTime },
      create: { userId, lessonId, status: "completed", completedAt: now, timeSpentMinutes: clampedTime },
    });

    // Award XP
    await tx.xpEvent.create({
      data: { userId, lessonId, type: "lesson-complete", points: 20, reason: "Lesson completed" },
    });

    // Update lesson status itself
    await tx.lesson.update({
      where: { id: lessonId },
      data: { status: "completed" },
    });
  });

  // Unlock next lesson in the same week (by order)
  const completedLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { weekId: true, order: true },
  });
  if (completedLesson) {
    const nextLesson = await db.lesson.findFirst({
      where: { weekId: completedLesson.weekId, order: completedLesson.order + 1, status: "locked" },
    });
    if (nextLesson) {
      await db.lesson.update({ where: { id: nextLesson.id }, data: { status: "available" } });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath("/lessons");

  return { success: true };
}

// ── submitAssignment ──────────────────────────────────────────────────────────

export async function submitAssignment(formData: FormData) {
  const userId = await requireUserId();

  const raw = {
    assignmentId: formData.get("assignmentId"),
    repoUrl: formData.get("repoUrl") || "",
    deploymentUrl: formData.get("deploymentUrl") || "",
    screenshotUrl: formData.get("screenshotUrl") || "",
    sqlScriptUrl: formData.get("sqlScriptUrl") || "",
    reflection: formData.get("reflection") || "",
    selfScore: formData.get("selfScore") || undefined,
    notes: formData.get("notes") || "",
  };

  const parsed = AssignmentSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { assignmentId, repoUrl, deploymentUrl, screenshotUrl, sqlScriptUrl, reflection, selfScore, notes } = parsed.data;

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { xpReward: true },
  });
  if (!assignment) return { success: false, error: "Assignment not found" };

  // Duplicate guard — no re-submissions once submitted
  const existing = await db.submission.findFirst({
    where: { assignmentId, userId },
    select: { id: true, status: true },
  });
  if (existing) {
    return { success: false, error: "You have already submitted this assignment", existingId: existing.id };
  }

  await db.$transaction([
    db.submission.create({
      data: {
        assignmentId,
        userId,
        repoUrl: repoUrl || null,
        deploymentUrl: deploymentUrl || null,
        screenshotUrl: screenshotUrl || null,
        sqlScriptUrl: sqlScriptUrl || null,
        reflection: reflection || null,
        selfScore: selfScore ?? null,
        notes: notes || null,
        status: "submitted",
        submittedAt: new Date(),
      },
    }),
    db.xpEvent.create({
      data: { userId, assignmentId, type: "assignment-submit", points: assignment.xpReward, reason: "Assignment submitted" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);

  return { success: true };
}

// ── addStudyLog ───────────────────────────────────────────────────────────────

export async function addStudyLog(formData: FormData) {
  const userId = await requireUserId();

  const raw = {
    minutes: formData.get("minutes"),
    date: (formData.get("date") as string) || undefined,
    trackId: (formData.get("trackId") as string) || undefined,
    mood: (formData.get("mood") as string) || undefined,
    energy: formData.get("energy") || undefined,
    learned: (formData.get("learned") as string) || undefined,
    blockers: (formData.get("blockers") as string) || undefined,
    nextStep: (formData.get("nextStep") as string) || undefined,
  };

  const parsed = StudyLogSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { minutes, date, trackId, mood, energy, learned, blockers, nextStep } = parsed.data;
  const logDate = date ? new Date(date) : new Date();

  // Scale XP: 5 per 10 min, capped at 30 (60+ min)
  const xpPoints = Math.min(30, Math.max(5, Math.round(minutes / 10) * 5));

  await db.$transaction([
    db.studyLog.create({
      data: { userId, date: logDate, trackId, minutes, mood, energy, learned, blockers, nextStep },
    }),
    db.xpEvent.create({
      data: { userId, trackId, type: "study-log", points: xpPoints, reason: `Logged ${minutes} minutes of study` },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/study-log");

  return { success: true };
}

// ── logStudySession ───────────────────────────────────────────────────────────
// Lightweight action called automatically by the study timer on session complete.

export async function logStudySession(minutes: number) {
  const userId = await requireUserId();

  const clampedMinutes = Math.min(Math.max(1, Math.round(minutes)), 120);
  const xpPoints = Math.min(30, Math.max(5, Math.round(clampedMinutes / 10) * 5));

  await db.$transaction([
    db.studyLog.create({
      data: { userId, date: new Date(), minutes: clampedMinutes },
    }),
    db.xpEvent.create({
      data: { userId, type: "study-log", points: xpPoints, reason: `Timer: ${clampedMinutes} min focus session` },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/study-log");
}

// ── completeRetro ─────────────────────────────────────────────────────────────

export async function completeRetro(weekId: string, notes: string) {
  const userId = await requireUserId();

  if (!weekId || typeof weekId !== "string") return { success: false, error: "Invalid week" };

  await db.$transaction([
    db.weekSprint.update({
      where: { id: weekId },
      data: { retrospectiveCompleted: true, retrospectiveNotes: notes },
    }),
    db.xpEvent.create({
      data: { userId, weekId, type: "retro", points: 30, reason: "Week retrospective completed" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/weeks");

  return { success: true };
}

// ── saveCheckpointAnswers ─────────────────────────────────────────────────────

export async function saveCheckpointAnswers(
  lessonId: string,
  answers: { questionIndex: number; answer: string; quality: 0 | 1 | 2 | 3 | 4 | 5 }[]
) {
  const userId = await requireUserId();
  if (answers.length === 0) return;

  // Fetch all existing answers in one query
  const existing = await db.lessonCheckpointAnswer.findMany({
    where: { userId, lessonId, questionIndex: { in: answers.map((a) => a.questionIndex) } },
  });
  const existingMap = new Map(existing.map((a) => [a.questionIndex, a]));

  // Compute SM-2 updates and run all upserts in a single transaction
  await db.$transaction(
    answers.map(({ questionIndex, answer, quality }) => {
      const prev = existingMap.get(questionIndex);
      const card = {
        repetitions: prev?.repetitions ?? 0,
        interval: prev?.interval ?? 1,
        easeFactor: prev?.easeFactor ?? 2.5,
      };
      const result = sm2(card, quality);
      return db.lessonCheckpointAnswer.upsert({
        where: { userId_lessonId_questionIndex: { userId, lessonId, questionIndex } },
        update: { answer, repetitions: result.repetitions, interval: result.interval, easeFactor: result.easeFactor, nextReview: result.nextReview },
        create: { userId, lessonId, questionIndex, answer, repetitions: result.repetitions, interval: result.interval, easeFactor: result.easeFactor, nextReview: result.nextReview },
      });
    })
  );
}

// ── addNote ───────────────────────────────────────────────────────────────────

export async function addNote(formData: FormData) {
  const userId = await requireUserId();

  const raw = {
    title: formData.get("title"),
    content: formData.get("content"),
    lessonId: (formData.get("lessonId") as string) || undefined,
    assignmentId: (formData.get("assignmentId") as string) || undefined,
    weekId: (formData.get("weekId") as string) || undefined,
    trackId: (formData.get("trackId") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
    pinned: (formData.get("pinned") as string) || undefined,
    reviewLater: (formData.get("reviewLater") as string) || undefined,
  };

  const parsed = NoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, content, lessonId, assignmentId, weekId, trackId, tags: tagsRaw, pinned, reviewLater } = parsed.data;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await db.$transaction([
    db.note.create({
      data: {
        userId, title, content, lessonId, assignmentId, weekId, trackId,
        tags,
        pinned: pinned === "true",
        reviewLater: reviewLater === "true",
      },
    }),
    db.xpEvent.create({
      data: { userId, lessonId, weekId, trackId, type: "note-added", points: 5, reason: "Note added" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  if (lessonId) revalidatePath("/lessons/[slug]", "page");

  return { success: true };
}
