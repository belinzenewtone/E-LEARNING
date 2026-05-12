"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { submitAssignment } from "@/server/actions/progress";
import { toast } from "sonner";

interface SubmissionFormProps {
  assignmentId: string;
}

export function SubmissionForm({ assignmentId }: SubmissionFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [sqlScriptUrl, setSqlScriptUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [reflection, setReflection] = useState("");
  const [selfScore, setSelfScore] = useState<number | "">("");
  const [isPending, startTransition] = useTransition();

  const hasUrl =
    repoUrl.trim() ||
    deploymentUrl.trim() ||
    sqlScriptUrl.trim() ||
    screenshotUrl.trim();
  const canSubmit =
    !!hasUrl &&
    reflection.trim().length > 0 &&
    selfScore !== "" &&
    Number(selfScore) >= 1 &&
    Number(selfScore) <= 10;

  function handleSubmit() {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("repoUrl", repoUrl);
    formData.set("deploymentUrl", deploymentUrl);
    formData.set("sqlScriptUrl", sqlScriptUrl);
    formData.set("screenshotUrl", screenshotUrl);
    formData.set("notes", notes);
    formData.set("reflection", reflection);
    formData.set("selfScore", String(selfScore));

    startTransition(async () => {
      try {
        await submitAssignment(formData);
        toast.success("Assignment submitted! XP earned.");
      } catch {
        toast.error("Failed to submit assignment. Please try again.");
      }
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Send className="h-4 w-4 text-primary" />
          Submit Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URLs */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GitHub Repository URL
            </Label>
            <Input
              type="url"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deployment URL
            </Label>
            <Input
              type="url"
              placeholder="https://your-app.vercel.app"
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              SQL Script URL
            </Label>
            <Input
              type="url"
              placeholder="https://gist.github.com/..."
              value={sqlScriptUrl}
              onChange={(e) => setSqlScriptUrl(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Screenshot URL
            </Label>
            <Input
              type="url"
              placeholder="https://imgur.com/..."
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Notes (optional)
          </Label>
          <Textarea
            placeholder="Any notes about your submission..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[72px] resize-y bg-muted/20 text-sm"
          />
        </div>

        {/* Reflection (required) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Reflection{" "}
            <span className="text-[var(--token-red)] normal-case font-normal">
              (required)
            </span>
          </Label>
          <Textarea
            placeholder="What did you learn? What was challenging? How would you do it differently?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[100px] resize-y bg-muted/20 text-sm"
          />
        </div>

        {/* Self score */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Self Score (1–10){" "}
            <span className="text-[var(--token-red)] normal-case font-normal">
              (required)
            </span>
          </Label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={selfScore === "" ? 5 : selfScore}
              onChange={(e) => setSelfScore(parseInt(e.target.value, 10))}
              className="form-range flex-1"
            />
            <span className="w-8 text-center text-sm font-bold text-foreground">
              {selfScore === "" ? "—" : selfScore}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Rate your own work honestly. 1 = barely started, 10 = exceptional.
          </p>
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
          {!isPending && <Send className="h-4 w-4" />}
        </Button>

        {!canSubmit && (
          <p className="text-center text-xs text-muted-foreground">
            Provide at least one URL, a reflection, and a self score to submit.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
