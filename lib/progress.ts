import { startOfDay, subDays } from "date-fns";

// ── calculateStreak ───────────────────────────────────────────────────────────

/**
 * Returns the number of consecutive days (ending today) where at least 30
 * minutes of study were logged. If today has no log it is skipped (streak not
 * broken) but it also does not contribute to the count.
 */
export function calculateStreak(
  studyLogs: { date: Date; minutes: number }[]
): number {
  let streak = 0;

  for (let i = 0; i < 60; i++) {
    const dayStart = startOfDay(subDays(new Date(), i));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const hit = studyLogs.find(
      (l) =>
        new Date(l.date) >= dayStart &&
        new Date(l.date) < dayEnd &&
        l.minutes >= 30
    );

    if (hit) {
      streak++;
    } else if (i === 0) {
      // today not yet logged — forgive and continue checking yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// ── calculateWeeklyScore ──────────────────────────────────────────────────────

export interface WeeklyScoreParams {
  lessonsTotal: number;
  lessonsCompleted: number;
  assignmentsTotal: number;
  assignmentsSubmitted: number;
  studiedToday: boolean;
  retroCompleted: boolean;
}

/**
 * Returns a weekly score 0–100:
 *   40% lesson completion rate
 *   40% assignment submission rate
 *   10% if studied today
 *   10% if retrospective is completed
 */
export function calculateWeeklyScore(params: WeeklyScoreParams): number {
  const {
    lessonsTotal,
    lessonsCompleted,
    assignmentsTotal,
    assignmentsSubmitted,
    studiedToday,
    retroCompleted,
  } = params;

  const lessonRate =
    lessonsTotal > 0 ? lessonsCompleted / lessonsTotal : 0;
  const assignmentRate =
    assignmentsTotal > 0 ? assignmentsSubmitted / assignmentsTotal : 0;

  const score =
    lessonRate * 40 +
    assignmentRate * 40 +
    (studiedToday ? 10 : 0) +
    (retroCompleted ? 10 : 0);

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ── calculateXpTotal ──────────────────────────────────────────────────────────

export function calculateXpTotal(events: { points: number }[]): number {
  return events.reduce((sum, e) => sum + e.points, 0);
}

// ── isLessonCompletable ───────────────────────────────────────────────────────

export interface LessonCompletableParams {
  studiedSource: boolean;
  checkpointsAnswered: boolean;
  hasReflection: boolean;
}

/**
 * A lesson is completable only when all three conditions are met.
 */
export function isLessonCompletable(params: LessonCompletableParams): boolean {
  return (
    params.studiedSource &&
    params.checkpointsAnswered &&
    params.hasReflection
  );
}

// ── isAssignmentSubmittable ───────────────────────────────────────────────────

export interface AssignmentSubmittableParams {
  hasProofLink: boolean;
  hasReflection: boolean;
  hasSelfScore: boolean;
}

/**
 * An assignment is submittable only when all three conditions are met.
 */
export function isAssignmentSubmittable(
  params: AssignmentSubmittableParams
): boolean {
  return params.hasProofLink && params.hasReflection && params.hasSelfScore;
}
