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
        // Reset form
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ClipboardList className="h-4 w-4 text-primary" />
          Log Today&apos;s Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row: date + track + minutes */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Track
            </Label>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="form-select flex h-9 w-full rounded-md border border-input bg-muted/20 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All / General</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Minutes Studied
            </Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 90"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-muted/20 text-sm"
            />
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mood
          </Label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  mood === m.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {m.emoji}
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy slider */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Energy Level — {energy}/5
          </Label>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
            className="form-range"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>Drained</span>
            <span>Energised</span>
          </div>
        </div>

        {/* Learned */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            What I Learned
          </Label>
          <Textarea
            placeholder="Key takeaways from today's session..."
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            className="min-h-[80px] resize-y bg-muted/20 text-sm"
          />
        </div>

        {/* Blockers */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Blockers / Challenges
          </Label>
          <Textarea
            placeholder="Anything that slowed you down today..."
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            className="min-h-[60px] resize-y bg-muted/20 text-sm"
          />
        </div>

        {/* Tomorrow's plan */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tomorrow&apos;s Plan
          </Label>
          <Textarea
            placeholder="What will you tackle next?"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            className="min-h-[60px] resize-y bg-muted/20 text-sm"
          />
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Logging…" : "Log Study Session"}
        </Button>
      </CardContent>
    </Card>
  );
}
