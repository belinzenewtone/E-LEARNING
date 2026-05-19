"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, BookOpen, RotateCcw, Trophy, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { saveCheckpointAnswers } from "@/server/actions/progress";
import { toast } from "sonner";
import type { ReviewQueueItem } from "@/server/queries/review";

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const CONFIDENCE = [
  { value: 1 as Quality, label: "Blank",   desc: "No recall at all",        color: "border-rose-500/40 bg-rose-500/10 text-rose-400" },
  { value: 2 as Quality, label: "Hard",    desc: "Barely remembered",       color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { value: 3 as Quality, label: "Ok",      desc: "Recalled with effort",    color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  { value: 4 as Quality, label: "Good",    desc: "Recalled correctly",      color: "border-[var(--token-cyan)]/40 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]" },
  { value: 5 as Quality, label: "Easy",    desc: "Recalled immediately",    color: "border-[var(--token-emerald)]/40 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]" },
];

interface ReviewClientProps {
  queue: ReviewQueueItem[];
}

export function ReviewClient({ queue }: ReviewClientProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<Quality | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--token-emerald)]/10 border border-[var(--token-emerald)]/20">
          <CheckCircle2 className="h-8 w-8 text-[var(--token-emerald)]" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">All caught up!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          No checkpoint questions are due for review right now. Keep studying and they'll appear here when it's time.
        </p>
        <Button asChild variant="outline">
          <Link href="/lessons">Browse Lessons</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--token-emerald)]/10 border border-[var(--token-emerald)]/20">
          <Trophy className="h-8 w-8 text-[var(--token-emerald)]" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Review session complete!</h2>
        <p className="text-sm text-muted-foreground">
          Reviewed <span className="font-semibold text-foreground">{completed}</span> of{" "}
          <span className="font-semibold text-foreground">{queue.length}</span> questions.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Each answer has been scheduled for its next review based on how well you recalled it.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/lessons">Continue Learning</Link>
          </Button>
        </div>
      </div>
    );
  }

  const item = queue[index];
  const progress = Math.round((index / queue.length) * 100);

  function handleSubmit() {
    if (!answer.trim() || confidence === null) return;
    startTransition(async () => {
      try {
        await saveCheckpointAnswers(item.lessonId, [{
          questionIndex: item.questionIndex,
          answer: answer.trim(),
          quality: confidence,
        }]);
        setCompleted((c) => c + 1);
        const nextIndex = index + 1;
        if (nextIndex >= queue.length) {
          setDone(true);
        } else {
          setIndex(nextIndex);
          setAnswer("");
          setConfidence(null);
          setShowPrevious(false);
        }
      } catch {
        toast.error("Failed to save answer. Please try again.");
      }
    });
  }

  function handleSkip() {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setDone(true);
    } else {
      setIndex(nextIndex);
      setAnswer("");
      setConfidence(null);
      setShowPrevious(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {index + 1} of {queue.length}</span>
          <span>{completed} reviewed</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Lesson context */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <Link href={`/lessons/${item.lessonSlug}`} className="hover:text-foreground transition-colors">
          {item.lessonTitle}
        </Link>
        <span>·</span>
        <span>Due {item.nextReview.toLocaleDateString()}</span>
        <span>·</span>
        <span>Interval: {item.interval}d</span>
      </div>

      {/* Question card */}
      <Card className="border-[var(--token-cyan)]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-[var(--token-cyan)]">
            <Brain className="h-4 w-4" />
            Checkpoint Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-medium text-foreground leading-relaxed">{item.question}</p>

          {/* Previous answer reveal */}
          <button
            onClick={() => setShowPrevious((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {showPrevious ? "Hide previous answer" : "Show previous answer"}
          </button>

          {showPrevious && (
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground italic">
              {item.lastAnswer}
            </div>
          )}

          {/* Answer textarea */}
          <Textarea
            placeholder="Write your answer from memory before revealing the previous one..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[100px] resize-y bg-muted/20 text-sm"
          />

          {/* Confidence rating */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How well did you recall this?</p>
            <div className="grid grid-cols-5 gap-1.5">
              {CONFIDENCE.map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setConfidence(value)}
                  title={desc}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all",
                    confidence === value
                      ? color
                      : "border-border bg-muted/20 text-muted-foreground/60 hover:text-foreground hover:border-border/80"
                  )}
                >
                  <span>{label}</span>
                  <span className="hidden sm:block text-[10px] opacity-70 font-normal text-center leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              disabled={!answer.trim() || confidence === null || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Saving…" : "Submit & Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      {queue.length > index + 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Next: <span className="text-foreground">{queue[index + 1].lessonTitle}</span>
        </p>
      )}
    </div>
  );
}
