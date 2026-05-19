"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, MessageSquare, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reviewSubmission } from "@/server/actions/assignments";
import { toast } from "sonner";

type ReviewStatus = "submitted" | "reviewed" | "approved" | "needs-improvement";

const STATUS_OPTIONS: { value: ReviewStatus; label: string; color: string; desc: string }[] = [
  {
    value: "needs-improvement",
    label: "Needs Improvement",
    color: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    desc: "Didn't meet the rubric criteria — revisit required",
  },
  {
    value: "reviewed",
    label: "Reviewed",
    color: "border-[var(--token-cyan)]/40 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]",
    desc: "Reviewed and meets expectations",
  },
  {
    value: "approved",
    label: "Approved",
    color: "border-[var(--token-emerald)]/40 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]",
    desc: "Exceeds expectations — excellent work",
  },
];

interface ReviewFormProps {
  submissionId: string;
  currentStatus: string;
  currentReviewerNotes: string | null;
}

export function ReviewForm({ submissionId, currentStatus, currentReviewerNotes }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ReviewStatus>(currentStatus as ReviewStatus);
  const [notes, setNotes] = useState(currentReviewerNotes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("submissionId", submissionId);
      formData.set("status", status);
      formData.set("reviewerNotes", notes);
      const result = await reviewSubmission(formData);
      if (result.success) {
        toast.success("Review saved.");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to save review.");
      }
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Self-Review
          </CardTitle>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Review your own submission against the rubric. This updates the submission status and adds mentor-style notes for future reference.
          </p>

          {/* Status selector */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outcome</p>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-xs transition-all",
                    status === opt.value
                      ? opt.color
                      : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="ml-2 opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Review Notes
            </p>
            <Textarea
              placeholder="What did you do well? What would you change? Any lessons learned..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-y bg-muted/20 text-sm"
            />
          </div>

          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleSubmit}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPending ? "Saving…" : "Save Review"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
