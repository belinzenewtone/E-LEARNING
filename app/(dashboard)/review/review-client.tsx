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
  { value: 1 as Quality, label: "Blank", desc: "No recall",        color: "border-[var(--token-red)]/40 bg-[var(--token-red)]/10 text-[var(--token-red)]" },
  { value: 2 as Quality, label: "Hard",  desc: "Barely",            color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { value: 3 as Quality, label: "Ok",    desc: "With effort",       color: "border-[var(--token-amber)]/40 bg-[var(--token-amber)]/10 text-[var(--token-amber)]" },
  { value: 4 as Quality, label: "Good",  desc: "Correctly",         color: "border-[var(--token-cyan)]/40 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]" },
  { value: 5 as Quality, label: "Easy",  desc: "Immediately",       color: "border-[var(--token-emerald)]/40 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]" },
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
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center max-w-2xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--token-emerald)]/10 border border-[var(--token-emerald)]/25">
          <CheckCircle2 className="h-8 w-8 text-[var(--token-emerald)]" />
        </div>
        <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase">
          SYSTEM // REVIEW QUEUE EMPTY
        </p>
        <h2 className="text-xl font-bold tracking-tight text-foreground">All caught up</h2>
        <p className="text-xs text-muted-foreground/80 max-w-sm">
          No checkpoint questions are due for review right now. Keep studying and they&apos;ll appear here when it&apos;s time.
        </p>
        <Button asChild variant="outline" className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
          <Link href="/lessons">BROWSE LESSONS →</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center max-w-2xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--token-emerald)]/10 border border-[var(--token-emerald)]/25">
          <Trophy className="h-8 w-8 text-[var(--token-emerald)]" />
        </div>
        <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase">
          SYSTEM // SESSION COMPLETE
        </p>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Review session complete</h2>
        <p className="text-xs text-muted-foreground/80">
          Reviewed <span className="font-mono font-bold text-foreground">{completed}</span> of{" "}
          <span className="font-mono font-bold text-foreground">{queue.length}</span> questions.
        </p>
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 max-w-sm">
          EACH ANSWER SCHEDULED FOR ITS NEXT REVIEW BASED ON RECALL QUALITY
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
            <Link href="/dashboard">DASHBOARD</Link>
          </Button>
          <Button asChild className="font-mono text-xs font-semibold uppercase tracking-wider">
            <Link href="/lessons">CONTINUE LEARNING →</Link>
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
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
          <span>QUESTION <span className="font-bold text-foreground">{index + 1}</span> / {queue.length}</span>
          <span>{completed} REVIEWED</span>
        </div>
        <Progress value={progress} className="h-1 bg-muted" />
      </div>

      {/* Lesson context */}
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 flex-wrap">
        <BookOpen className="h-3 w-3" />
        <Link href={`/lessons/${item.lessonSlug}`} className="hover:text-foreground transition-colors">
          {item.lessonTitle}
        </Link>
        <span>·</span>
        <span>DUE {item.nextReview.toLocaleDateString().toUpperCase()}</span>
        <span>·</span>
        <span>INTERVAL {item.interval}D</span>
      </div>

      {/* Question card */}
      <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-cyan)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--token-cyan)]">
            <Brain className="h-4 w-4" />
            CHECKPOINT QUESTION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-semibold text-foreground leading-relaxed">{item.question}</p>

          <button
            onClick={() => setShowPrevious((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {showPrevious ? "HIDE PREVIOUS ANSWER" : "SHOW PREVIOUS ANSWER"}
          </button>

          {showPrevious && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground/80 italic">
              {item.lastAnswer}
            </div>
          )}

          <Textarea
            placeholder="Write your answer from memory before revealing the previous one..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[100px] resize-y bg-muted/20 text-sm"
          />

          <div className="space-y-2">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">
              HOW WELL DID YOU RECALL THIS?
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {CONFIDENCE.map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setConfidence(value)}
                  title={desc}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider transition-all",
                    confidence === value
                      ? color
                      : "border-border/80 bg-muted/20 text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                  <span>{label}</span>
                  <span className="hidden sm:block text-[9px] opacity-70 font-normal text-center leading-tight normal-case">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
            >
              SKIP
            </Button>
            <Button
              className="flex-1 font-mono text-xs font-semibold uppercase tracking-wider"
              disabled={!answer.trim() || confidence === null || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "SAVING…" : "SUBMIT & NEXT"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {queue.length > index + 1 && (
        <p className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          NEXT // <span className="text-foreground/80">{queue[index + 1].lessonTitle}</span>
        </p>
      )}
    </div>
  );
}
