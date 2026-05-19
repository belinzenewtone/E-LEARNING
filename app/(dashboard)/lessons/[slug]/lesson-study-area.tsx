"use client";

import { useState, useTransition, useOptimistic, useRef, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  PenLine,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Check,
  Trophy,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { completeLesson, addNote, saveCheckpointAnswers } from "@/server/actions/progress";
import { toast } from "sonner";

interface CheckpointQuestion {
  question: string;
}

interface ExistingNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface ExistingAnswer {
  questionIndex: number;
  answer: string;
}

interface LessonStudyAreaProps {
  lessonId: string;
  lessonSlug: string;
  userId: string;
  estimatedMinutes: number;
  checkpointQuestions: CheckpointQuestion[];
  existingNotes: ExistingNote[];
  existingAnswers: ExistingAnswer[];
  isCompleted: boolean;
}

type StepStatus = "done" | "active" | "locked";
type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const CONFIDENCE_LABELS: { value: Quality; label: string; color: string }[] = [
  { value: 1, label: "Blank",   color: "border-rose-500/40 bg-rose-500/10 text-rose-400" },
  { value: 2, label: "Hard",    color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { value: 3, label: "Ok",      color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  { value: 4, label: "Good",    color: "border-[var(--token-cyan)]/40 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]" },
  { value: 5, label: "Easy",    color: "border-[var(--token-emerald)]/40 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]" },
];

const MIN_NOTE_CHARS = 10;
const MIN_REFLECTION_CHARS = 20;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function StepBadge({ number, status }: { number: number; status: StepStatus }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
        status === "done" &&
          "border-[var(--token-emerald)] bg-[var(--token-emerald)] text-white",
        status === "active" &&
          "border-[var(--token-cyan)] bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]",
        status === "locked" &&
          "border-border bg-muted/20 text-muted-foreground/50"
      )}
    >
      {status === "done" ? <Check className="h-3.5 w-3.5" /> : number}
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        "h-px flex-1 transition-all",
        done ? "bg-[var(--token-emerald)]/40" : "bg-border/40"
      )}
    />
  );
}

export function LessonStudyArea({
  lessonId,
  lessonSlug,
  estimatedMinutes,
  checkpointQuestions,
  existingNotes,
  existingAnswers,
  isCompleted,
}: LessonStudyAreaProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [noteContent, setNoteContent] = useState(existingNotes[0]?.content ?? "");
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<number, string>>(
    Object.fromEntries(existingAnswers.map((a) => [a.questionIndex, a.answer]))
  );
  const [checkpointConfidence, setCheckpointConfidence] = useState<Record<number, Quality>>({});
  const [reflection, setReflection] = useState({ understood: "", confused: "", apply: "" });
  const [isPending, startTransition] = useTransition();
  const [isSavingNote, startSavingNote] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(isCompleted);

  // Live elapsed-time counter (pauses once completed)
  useEffect(() => {
    if (isCompleted) return;
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 5000);
    return () => clearInterval(id);
  }, [isCompleted]);

  const hasNote = noteContent.trim().length >= MIN_NOTE_CHARS;
  const hasAnsweredCheckpoint =
    checkpointQuestions.length === 0 ||
    Object.values(checkpointAnswers).some((a) => a.trim().length > 0);
  const hasReflection =
    reflection.understood.trim().length >= MIN_REFLECTION_CHARS ||
    reflection.confused.trim().length >= MIN_REFLECTION_CHARS ||
    reflection.apply.trim().length >= MIN_REFLECTION_CHARS;

  const step1Done = sourceReviewed;
  const step2Done = hasNote;
  const step3Done = hasAnsweredCheckpoint;
  const step4Done = hasReflection;
  const canComplete = step1Done && step2Done && step3Done && step4Done && !optimisticCompleted;

  const hasCheckpoints = checkpointQuestions.length > 0;

  function getStepStatus(stepDone: boolean, prevDone: boolean): StepStatus {
    if (stepDone) return "done";
    if (prevDone) return "active";
    return "locked";
  }

  const s1: StepStatus = step1Done ? "done" : "active";
  const s2: StepStatus = getStepStatus(step2Done, step1Done);
  const s3: StepStatus = hasCheckpoints ? getStepStatus(step3Done, step2Done) : "done";
  const s4: StepStatus = getStepStatus(step4Done, hasCheckpoints ? step3Done : step2Done);

  function handleAnswerChange(index: number, value: string) {
    setCheckpointAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function handleConfidenceChange(index: number, value: Quality) {
    setCheckpointConfidence((prev) => ({ ...prev, [index]: value }));
  }

  function handleCompleteLesson() {
    startTransition(async () => {
      setOptimisticCompleted(true);
      try {
        const timeSpentMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));

        const answers = Object.entries(checkpointAnswers)
          .filter(([, ans]) => ans.trim().length > 0)
          .map(([idx, answer]) => ({
            questionIndex: Number(idx),
            answer,
            quality: (checkpointConfidence[Number(idx)] ?? 3) as Quality,
          }));
        if (answers.length > 0) {
          try {
            await saveCheckpointAnswers(lessonId, answers);
          } catch {
            /* schema not yet migrated */
          }
        }
        await completeLesson(lessonId, timeSpentMinutes);
        toast.success("Lesson completed! +20 XP earned.");
      } catch {
        setOptimisticCompleted(false);
        toast.error("Failed to complete lesson. Please try again.");
      }
    });
  }

  function handleSaveNote() {
    if (!noteContent.trim()) return;
    const formData = new FormData();
    formData.set("title", `Notes — ${lessonSlug}`);
    formData.set("content", noteContent);
    formData.set("lessonId", lessonId);
    startSavingNote(async () => {
      try {
        await addNote(formData);
        toast.success("Note saved.");
      } catch {
        toast.error("Failed to save note.");
      }
    });
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const timeColor =
    elapsedMinutes >= estimatedMinutes
      ? "text-[var(--token-emerald)]"
      : "text-muted-foreground";

  return (
    <div className="space-y-4">
      {/* Step progress header */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Study Steps
            </p>
            {!optimisticCompleted && (
              <span className={cn("flex items-center gap-1 text-[11px]", timeColor)}>
                <Clock className="h-3 w-3" />
                {formatElapsed(elapsedSeconds)}
                <span className="text-muted-foreground/60">/ {estimatedMinutes}m est.</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StepBadge number={1} status={s1} />
            <StepConnector done={step1Done} />
            <StepBadge number={2} status={s2} />
            <StepConnector done={step2Done} />
            {hasCheckpoints && (
              <>
                <StepBadge number={3} status={s3} />
                <StepConnector done={step3Done} />
                <StepBadge number={4} status={s4} />
              </>
            )}
            {!hasCheckpoints && <StepBadge number={3} status={s4} />}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Review</span>
            <span>Notes</span>
            {hasCheckpoints && (
              <>
                <span>Checkpoints</span>
                <span>Reflect</span>
              </>
            )}
            {!hasCheckpoints && <span>Reflect</span>}
          </div>
        </CardContent>
      </Card>

      {/* Step 1 — Review Source */}
      <StepCard
        number={1}
        title="Review the Source"
        icon={<BookOpen className="h-4 w-4" />}
        status={s1}
        iconColor="text-[var(--token-cyan)]"
      >
        <button
          onClick={() => setSourceReviewed((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
            sourceReviewed
              ? "border-[var(--token-emerald)]/30 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]"
              : "border-border bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          {sourceReviewed ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <Circle className="h-4 w-4 shrink-0" />
          )}
          {sourceReviewed ? "Source reviewed — nice work!" : "Mark as Source Reviewed"}
        </button>
      </StepCard>

      {/* Step 2 — Personal Notes */}
      <StepCard
        number={2}
        title="Personal Notes"
        icon={<PenLine className="h-4 w-4" />}
        status={s2}
        iconColor="text-primary"
      >
        <Textarea
          placeholder="Capture key ideas, examples, or anything worth remembering..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="min-h-[120px] resize-y bg-muted/20 text-sm"
        />
        <div className="flex items-center justify-between">
          <span className={cn("text-[11px]", noteContent.trim().length >= MIN_NOTE_CHARS ? "text-[var(--token-emerald)]" : "text-muted-foreground/60")}>
            {noteContent.trim().length}/{MIN_NOTE_CHARS}+ chars
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveNote}
            disabled={isSavingNote || !noteContent.trim()}
          >
            {isSavingNote ? "Saving…" : "Save Note"}
          </Button>
        </div>
      </StepCard>

      {/* Step 3 — Checkpoint Questions (conditional) */}
      {hasCheckpoints && (
        <StepCard
          number={3}
          title="Checkpoint Questions"
          icon={<HelpCircle className="h-4 w-4" />}
          status={s3}
          iconColor="text-[var(--token-amber)]"
        >
          <div className="space-y-6">
            {checkpointQuestions.map((q, i) => (
              <div key={i} className="space-y-2">
                <Label className="text-sm font-medium text-foreground leading-snug">
                  {i + 1}. {q.question}
                </Label>
                <Textarea
                  placeholder="Your answer..."
                  value={checkpointAnswers[i] ?? ""}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  className="min-h-[80px] resize-y bg-muted/20 text-sm"
                />
                {/* Confidence rating */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Recall:</span>
                  {CONFIDENCE_LABELS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => handleConfidenceChange(i, value)}
                      className={cn(
                        "rounded border px-2 py-0.5 text-[11px] font-medium transition-all",
                        checkpointConfidence[i] === value
                          ? color
                          : "border-border bg-muted/20 text-muted-foreground/60 hover:text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </StepCard>
      )}

      {/* Step 3 or 4 — Reflection */}
      <StepCard
        number={hasCheckpoints ? 4 : 3}
        title="Reflection"
        icon={<Lightbulb className="h-4 w-4" />}
        status={s4}
        iconColor="text-[var(--token-emerald)]"
      >
        <div className="space-y-4">
          {(
            [
              {
                key: "understood" as const,
                prompt: "What did I understand?",
                placeholder: "Summarize the concepts that clicked for you...",
              },
              {
                key: "confused" as const,
                prompt: "What confused me?",
                placeholder: "Note anything that felt unclear or tricky...",
              },
              {
                key: "apply" as const,
                prompt: "Where can I apply this?",
                placeholder: "Think about real-world contexts where this knowledge is useful...",
              },
            ] as const
          ).map(({ key, prompt, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {prompt}
                </Label>
                {reflection[key].trim().length > 0 && (
                  <span className={cn("text-[11px]", reflection[key].trim().length >= MIN_REFLECTION_CHARS ? "text-[var(--token-emerald)]" : "text-muted-foreground/60")}>
                    {reflection[key].trim().length}/{MIN_REFLECTION_CHARS}+
                  </span>
                )}
              </div>
              <Textarea
                placeholder={placeholder}
                value={reflection[key]}
                onChange={(e) => setReflection((prev) => ({ ...prev, [key]: e.target.value }))}
                className="min-h-[72px] resize-y bg-muted/20 text-sm"
              />
            </div>
          ))}
        </div>
      </StepCard>

      {/* Complete button */}
      <div className="pt-1">
        {optimisticCompleted ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--token-emerald)]/30 bg-[var(--token-emerald)]/10 py-3 text-sm font-medium text-[var(--token-emerald)]">
            <Trophy className="h-4 w-4" />
            Lesson Completed — Great work!
          </div>
        ) : (
          <>
            <Button
              size="lg"
              className={cn(
                "w-full transition-all",
                canComplete
                  ? "bg-[var(--token-emerald)] hover:bg-[var(--token-emerald)]/85 text-white"
                  : ""
              )}
              disabled={!canComplete || isPending}
              onClick={handleCompleteLesson}
            >
              {isPending ? "Completing…" : "Complete Lesson"}
              {canComplete && <CheckCircle2 className="h-4 w-4" />}
            </Button>
            {!canComplete && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {!step1Done
                  ? "Mark the source reviewed to begin."
                  : !step2Done
                  ? `Add at least ${MIN_NOTE_CHARS} characters of notes before continuing.`
                  : !step3Done
                  ? "Answer at least one checkpoint question."
                  : `Write at least ${MIN_REFLECTION_CHARS} characters in one reflection field.`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── StepCard helper ───────────────────────────────────────────────────────────

interface StepCardProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  status: StepStatus;
  iconColor: string;
  children: React.ReactNode;
}

function StepCard({ number, title, icon, status, iconColor, children }: StepCardProps) {
  return (
    <Card
      className={cn(
        "border transition-all",
        status === "done" && "border-[var(--token-emerald)]/25 bg-card",
        status === "active" && "border-[var(--token-cyan)]/30 bg-card shadow-sm",
        status === "locked" && "border-border bg-card opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-sm">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              status === "done" &&
                "bg-[var(--token-emerald)] text-white",
              status === "active" &&
                "bg-[var(--token-cyan)]/15 text-[var(--token-cyan)]",
              status === "locked" &&
                "bg-muted/40 text-muted-foreground/50"
            )}
          >
            {status === "done" ? <Check className="h-3 w-3" /> : number}
          </span>
          <span className={cn("flex items-center gap-1.5", status === "locked" && "text-muted-foreground/60")}>
            <span className={status !== "locked" ? iconColor : ""}>{icon}</span>
            {title}
          </span>
          {status === "done" && (
            <CheckCircle2 className="ml-auto h-4 w-4 text-[var(--token-emerald)]" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
