/**
 * Unit tests for progress engine pure functions.
 * Run with: npx tsx --test tests/progress.unit.test.ts
 * Or use vitest/jest if configured.
 */

import { calculateStreak, calculateWeeklyScore, calculateXpTotal, isLessonCompletable, isAssignmentSubmittable } from "../lib/progress";
import { sm2, isDue } from "../lib/spaced-repetition";

// Simple test runner
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ ${name}: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(n: number) {
      if (typeof actual !== "number" || actual <= n) {
        throw new Error(`Expected ${actual} to be greater than ${n}`);
      }
    },
    toBeLessThanOrEqual(n: number) {
      if (typeof actual !== "number" || actual > n) {
        throw new Error(`Expected ${actual} to be <= ${n}`);
      }
    },
  };
}

// ── calculateStreak ──────────────────────────────────────────────────────────

test("streak is 0 with no logs", () => {
  expect(calculateStreak([])).toBe(0);
});

test("streak counts consecutive days >= 30 minutes", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const logs = [
    { date: twoDaysAgo, minutes: 60 },
    { date: yesterday, minutes: 45 },
    { date: today, minutes: 30 },
  ];

  const streak = calculateStreak(logs);
  expect(streak).toBeGreaterThan(0);
});

test("streak breaks if a day has < 30 minutes", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const logs = [
    { date: twoDaysAgo, minutes: 60 },
    { date: yesterday, minutes: 10 }, // break!
    { date: today, minutes: 60 },
  ];

  // Should only count today (or today + today-forgiveness)
  const streak = calculateStreak(logs);
  expect(streak).toBeLessThanOrEqual(2);
});

// ── calculateWeeklyScore ─────────────────────────────────────────────────────

test("weekly score is 0 when nothing is done", () => {
  const score = calculateWeeklyScore({
    lessonsTotal: 5,
    lessonsCompleted: 0,
    assignmentsTotal: 2,
    assignmentsSubmitted: 0,
    studiedToday: false,
    retroCompleted: false,
  });
  expect(score).toBe(0);
});

test("weekly score is 100 when everything is complete", () => {
  const score = calculateWeeklyScore({
    lessonsTotal: 5,
    lessonsCompleted: 5,
    assignmentsTotal: 2,
    assignmentsSubmitted: 2,
    studiedToday: true,
    retroCompleted: true,
  });
  expect(score).toBe(100);
});

test("weekly score at 50% lessons + 100% assignments + studied = correct", () => {
  const score = calculateWeeklyScore({
    lessonsTotal: 10,
    lessonsCompleted: 5,
    assignmentsTotal: 1,
    assignmentsSubmitted: 1,
    studiedToday: true,
    retroCompleted: false,
  });
  // 40% * 0.5 + 40% * 1.0 + 10% + 0% = 20 + 40 + 10 = 70
  expect(score).toBe(70);
});

// ── calculateXpTotal ─────────────────────────────────────────────────────────

test("XP total sums all events", () => {
  const events = [{ points: 20 }, { points: 80 }, { points: 10 }];
  expect(calculateXpTotal(events)).toBe(110);
});

test("XP total is 0 with empty events", () => {
  expect(calculateXpTotal([])).toBe(0);
});

// ── isLessonCompletable ──────────────────────────────────────────────────────

test("lesson completable when all conditions met", () => {
  expect(
    isLessonCompletable({ studiedSource: true, checkpointsAnswered: true, hasReflection: true })
  ).toBe(true);
});

test("lesson not completable if reflection missing", () => {
  expect(
    isLessonCompletable({ studiedSource: true, checkpointsAnswered: true, hasReflection: false })
  ).toBe(false);
});

test("lesson not completable if checkpoints not answered", () => {
  expect(
    isLessonCompletable({ studiedSource: true, checkpointsAnswered: false, hasReflection: true })
  ).toBe(false);
});

// ── isAssignmentSubmittable ──────────────────────────────────────────────────

test("assignment submittable when all fields present", () => {
  expect(
    isAssignmentSubmittable({ hasProofLink: true, hasReflection: true, hasSelfScore: true })
  ).toBe(true);
});

test("assignment not submittable without proof link", () => {
  expect(
    isAssignmentSubmittable({ hasProofLink: false, hasReflection: true, hasSelfScore: true })
  ).toBe(false);
});

// ── sm2 spaced repetition ────────────────────────────────────────────────────

test("sm2: first correct response sets interval to 1", () => {
  const card = { repetitions: 0, interval: 0, easeFactor: 2.5 };
  const result = sm2(card, 4);
  expect(result.interval).toBe(1);
  expect(result.repetitions).toBe(1);
});

test("sm2: second correct response sets interval to 6", () => {
  const card = { repetitions: 1, interval: 1, easeFactor: 2.5 };
  const result = sm2(card, 4);
  expect(result.interval).toBe(6);
  expect(result.repetitions).toBe(2);
});

test("sm2: incorrect response resets repetitions and interval", () => {
  const card = { repetitions: 3, interval: 20, easeFactor: 2.5 };
  const result = sm2(card, 1);
  expect(result.repetitions).toBe(0);
  expect(result.interval).toBe(1);
});

test("sm2: ease factor never falls below 1.3", () => {
  let card = { repetitions: 0, interval: 0, easeFactor: 1.4 };
  // Multiple wrong answers
  for (let i = 0; i < 5; i++) {
    card = sm2(card, 0);
  }
  expect(card.easeFactor).toBe(1.3);
});

test("sm2: nextReview is in the future", () => {
  const card = { repetitions: 0, interval: 0, easeFactor: 2.5 };
  const result = sm2(card, 4);
  if (result.nextReview <= new Date()) {
    throw new Error(`Expected nextReview to be in the future`);
  }
});

// ── isDue ────────────────────────────────────────────────────────────────────

test("isDue: null nextReview is always due", () => {
  if (!isDue(null)) throw new Error("Expected isDue(null) to be true");
});

test("isDue: past date is due", () => {
  const past = new Date(Date.now() - 1000);
  if (!isDue(past)) throw new Error("Expected past date to be due");
});

test("isDue: future date is not due", () => {
  const future = new Date(Date.now() + 86400000);
  if (isDue(future)) throw new Error("Expected future date to not be due");
});

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
if (failed > 0) process.exit(1);
