"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { completeRetro } from "@/server/actions/progress";
import { toast } from "sonner";

interface RetroFormProps {
  weekId: string;
  existingNotes: string;
  isCompleted: boolean;
}

export function RetroForm({
  weekId,
  existingNotes,
  isCompleted,
}: RetroFormProps) {
  const [notes, setNotes] = useState(existingNotes);
  const [done, setDone] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!notes.trim()) {
      toast.error("Please write some retrospective notes before submitting.");
      return;
    }
    startTransition(async () => {
      try {
        await completeRetro(weekId, notes);
        setDone(true);
        toast.success("Retrospective submitted! +30 XP earned.");
      } catch {
        toast.error("Failed to submit retrospective.");
      }
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        {done && (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--token-emerald)]/20 bg-[var(--token-emerald)]/10 px-3 py-2 text-sm text-[var(--token-emerald)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Retrospective completed!
          </div>
        )}
        <Textarea
          placeholder="Write your sprint retrospective here. What went well? What was challenging? What will you do differently next week?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={done}
          className="min-h-[140px] resize-y bg-muted/20 text-sm"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={done || isPending || !notes.trim()}
            size="sm"
          >
            {done
              ? "Retrospective Submitted"
              : isPending
              ? "Submitting…"
              : "Submit Retrospective"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
