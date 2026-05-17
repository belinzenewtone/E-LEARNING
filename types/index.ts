export type TrackSlug = "web" | "data-engineering" | "python-fastapi";

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";
export type ModuleStatus = "locked" | "active" | "completed";
export type WeekStatus = "locked" | "active" | "completed";
export type AssignmentStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "reviewed"
  | "needs-improvement"
  | "completed";
export type SubmissionStatus = "submitted" | "reviewed" | "approved" | "needs-improvement";
export type GoalStatus = "active" | "completed" | "paused" | "abandoned";
export type BlockerStatus = "open" | "resolved" | "ignored";
export type Mood = "great" | "good" | "neutral" | "tired" | "frustrated";

export type XpEventType =
  | "lesson-complete"
  | "checkpoint"
  | "assignment-submit"
  | "retro"
  | "study-log"
  | "capstone"
  | "note-added";

export const XP_VALUES: Record<XpEventType, number> = {
  "lesson-complete": 20,
  checkpoint: 10,
  "assignment-submit": 80,
  retro: 30,
  "study-log": 10,
  capstone: 150,
  "note-added": 5,
};

export type DashboardStats = {
  totalXp: number;
  streak: number;
  webProgress: number;
  dataProgress: number;
  pythonProgress: number;
  overallProgress: number;
  studyMinutesThisWeek: number;
  weeklyScore: number;
  currentWeek: number | null;
  lessonsCompletedToday: number;
  overdueAssignments: number;
};

export type CheckpointQuestion = {
  question: string;
  options?: string[];
  answer?: string;
  type: "multiple-choice" | "short-answer" | "reflection";
};

export type RubricItem = {
  criterion: string;
  maxPoints: number;
  description: string;
};

export type Deliverable = {
  type: "github" | "deployment" | "sql-script" | "screenshot" | "reflection" | "document";
  label: string;
  required: boolean;
};
