"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addStudyLog } from "@/server/actions/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: "great", emoji: "🚀", label: "Great" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "frustrated", emoji: "😤", label: "Frustrated" },
] as const;

type MoodValue = (typeof MOODS)[number]["value"];

interface Track {
  id: string;
  name: string;
  slug: string;
}

interface StudyLogFormProps {
  tracks: Track[];
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-[10px] font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">
      {children}
    </Label>
  );
}

export function StudyLogForm({ tracks }: StudyLogFormProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [trackId, setTrackId] = useState("");
  const [minutes, setMinutes] = useState("");
  const [mood, setMood] = useState<MoodValue | "">("");
  const [energy, setEnergy] = useState<number>(3);
  const [learned, setLearned] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = date && Number(minutes) > 0;

  function handleSubmit() {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.set("date", date);
    formData.set("minutes", minutes);
    if (trackId) formData.set("trackId", trackId);
    if (mood) formData.set("mood", mood);
    formData.set("energy", String(energy));
    if (learned.trim()) formData.set("learned", learned);
    if (blockers.trim()) formData.set("blockers", blockers);
    if (nextStep.trim()) formData.set("nextStep", nextStep);

    startTransition(async () => {
      try {
        await addStudyLog(formData);
        setDate(today);
        setTrackId("");
        setMinutes("");
        setMood("");
        setEnergy(3);
        setLearned("");
        setBlockers("");
        setNextStep("");
        toast.success("Study session logged! +10 XP earned.");
      } catch {
        toast.error("Failed to log study session.");
      }
    });
  }

  return (
    <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
          <ClipboardList className="h-4 w-4 text-primary" />
          LOG TODAY&apos;S SESSION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <FieldLabel>DATE</FieldLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-muted/20 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>TRACK</FieldLabel>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="form-select flex h-9 w-full rounded-md border border-input bg-muted/20 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All / General</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>MINUTES STUDIED</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 90"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-muted/20 text-sm font-mono"
            />
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-1.5">
          <FieldLabel>MOOD</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded border px-3 py-1 text-xs transition-colors",
                  mood === m.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 text-muted-foreground hover:text-foreground"
                )}
              >
                {m.emoji}
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-1.5">
          <FieldLabel>ENERGY LEVEL — {energy}/5</FieldLabel>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
            className="form-range"
          />
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
            <span>DRAINED</span>
            <span>ENERGISED</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>WHAT I LEARNED</FieldLabel>
          <Textarea
            placeholder="Key takeaways from today's session..."
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            className="min-h-[80px] resize-y bg-muted/20 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>BLOCKERS / CHALLENGES</FieldLabel>
          <Textarea
            placeholder="Anything that slowed you down today..."
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            className="min-h-[60px] resize-y bg-muted/20 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>TOMORROW&apos;S PLAN</FieldLabel>
          <Textarea
            placeholder="What will you tackle next?"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            className="min-h-[60px] resize-y bg-muted/20 text-sm"
          />
        </div>

        <Button
          className="w-full font-mono text-xs font-semibold uppercase tracking-wider"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
        >
          {isPending ? "LOGGING…" : "LOG STUDY SESSION"}
        </Button>
      </CardContent>
    </Card>
  );
}
