/**
 * Unit tests for progress engine pure functions.
 * Run with: npx tsx --test tests/progress.unit.test.ts
 * Or use vitest/jest if configured.
 */

import { calculateStreak, calculateWeeklyScore, calculateXpTotal, isLessonCompletable, isAssignmentSubmittable } from "../lib/progress";

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

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
if (failed > 0) process.exit(1);
