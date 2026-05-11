"use client";

import { useState, useTransition, useOptimistic } from "react";
import { CheckCircle2, Circle, PenLine, HelpCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  checkpointQuestions: CheckpointQuestion[];
  existingNotes: ExistingNote[];
  existingAnswers: ExistingAnswer[];
  isCompleted: boolean;
}

export function LessonStudyArea({
  lessonId,
  lessonSlug,
  checkpointQuestions,
  existingNotes,
  existingAnswers,
  isCompleted,
}: LessonStudyAreaProps) {
  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [noteContent, setNoteContent] = useState(
    existingNotes[0]?.content ?? ""
  );
  const [checkpointAnswers, setCheckpointAnswers] = useState<
    Record<number, string>
  >(
    Object.fromEntries(existingAnswers.map((a) => [a.questionIndex, a.answer]))
  );
  const [reflection, setReflection] = useState({
    understood: "",
    confused: "",
    apply: "",
  });
  const [isPending, startTransition] = useTransition();
  const [isSavingNote, startSavingNote] = useTransition();

  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(isCompleted);

  // Validation for complete button
  const hasAnsweredCheckpoint =
    checkpointQuestions.length === 0 ||
    Object.values(checkpointAnswers).some((a) => a.trim().length > 0);
  const hasReflection =
    reflection.understood.trim().length > 0 ||
    reflection.confused.trim().length > 0 ||
    reflection.apply.trim().length > 0;
  const canComplete =
    sourceReviewed && hasAnsweredCheckpoint && hasReflection && !optimisticCompleted;

  function handleAnswerChange(index: number, value: string) {
    setCheckpointAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function handleCompleteLesson() {
    startTransition(async () => {
      setOptimisticCompleted(true);
      try {
        // Save checkpoint answers with SM-2 spaced repetition (quality 4 = "correct")
        const answers = Object.entries(checkpointAnswers)
          .filter(([, ans]) => ans.trim().length > 0)
          .map(([idx, answer]) => ({
            questionIndex: Number(idx),
            answer,
            quality: 4 as const,
          }));
        if (answers.length > 0) {
          try { await saveCheckpointAnswers(lessonId, answers); } catch { /* schema not yet migrated */ }
        }
        await completeLesson(lessonId);
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

  return (
    <div className="space-y-5">
      {/* Source review toggle */}
      <Card className="border-border/40 bg-card/60">
        <CardContent className="p-4">
          <button
            onClick={() => setSourceReviewed((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
              sourceReviewed
                ? "border-[var(--token-emerald)]/30 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]"
                : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {sourceReviewed ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 shrink-0" />
            )}
            {sourceReviewed
              ? "Source reviewed — good job!"
              : "Mark as Source Reviewed"}
          </button>
        </CardContent>
      </Card>

      {/* Personal notes */}
      <Card className="border-border/40 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <PenLine className="h-4 w-4 text-primary" />
            Personal Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Type your notes here. Capture key ideas, examples, or anything worth remembering..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-[120px] resize-y bg-muted/20 text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNote}
              disabled={isSavingNote || !noteContent.trim()}
            >
              {isSavingNote ? "Saving…" : "Save Note"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint questions */}
      {checkpointQuestions.length > 0 && (
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-[var(--token-amber)]" />
              Checkpoint Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reflection */}
      <Card className="border-border/40 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-[var(--token-emerald)]" />
            Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
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
          ].map(({ key, prompt, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {prompt}
              </Label>
              <Textarea
                placeholder={placeholder}
                value={reflection[key]}
                onChange={(e) =>
                  setReflection((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="min-h-[72px] resize-y bg-muted/20 text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Complete button */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          disabled={!canComplete || isPending}
          onClick={handleCompleteLesson}
        >
          {optimisticCompleted
            ? "Lesson Completed"
            : isPending
            ? "Completing…"
            : "Complete Lesson"}
          {optimisticCompleted && <CheckCircle2 className="h-4 w-4 text-[var(--token-emerald)]" />}
        </Button>
        {!canComplete && !optimisticCompleted && (
          <p className="text-center text-xs text-muted-foreground">
            Mark source reviewed, answer at least one checkpoint, and fill in
            your reflection to complete.
          </p>
        )}
      </div>
    </div>
  );
}
