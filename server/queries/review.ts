import { db } from "@/lib/db";

export type ReviewQueueItem = {
  answerId: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  questionIndex: number;
  question: string;
  lastAnswer: string;
  nextReview: Date;
  interval: number;
  repetitions: number;
  easeFactor: number;
};

export async function getReviewQueue(userId: string): Promise<ReviewQueueItem[]> {
  const now = new Date();
  const answers = await db.lessonCheckpointAnswer.findMany({
    where: { userId, nextReview: { lte: now } },
    include: {
      lesson: { select: { id: true, title: true, slug: true, checkpointQuestions: true } },
    },
    orderBy: { nextReview: "asc" },
  });

  return answers.flatMap((a) => {
    const questions = a.lesson.checkpointQuestions as { question: string }[];
    const q = questions[a.questionIndex];
    if (!q) return [];
    return [{
      answerId: a.id,
      lessonId: a.lessonId,
      lessonTitle: a.lesson.title,
      lessonSlug: a.lesson.slug,
      questionIndex: a.questionIndex,
      question: q.question,
      lastAnswer: a.answer,
      nextReview: a.nextReview ?? now,
      interval: a.interval,
      repetitions: a.repetitions,
      easeFactor: a.easeFactor,
    }];
  });
}

export async function getDueReviewCount(userId: string): Promise<number> {
  return db.lessonCheckpointAnswer.count({
    where: { userId, nextReview: { lte: new Date() } },
  });
}
