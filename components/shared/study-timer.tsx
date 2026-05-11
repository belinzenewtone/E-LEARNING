"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const WORK_SECONDS = 25 * 60; // 25 minutes
const BREAK_SECONDS = 5 * 60; //  5 minutes

type Mode = "work" | "break";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── SVG ring ──────────────────────────────────────────────────────────────────

interface TimerRingProps {
  /** 0–1 fraction of time remaining */
  fraction: number;
  mode: Mode;
  /** Display label inside the ring */
  label: string;
  size?: number;
  strokeWidth?: number;
}

function TimerRing({
  fraction,
  mode,
  label,
  size = 120,
  strokeWidth = 8,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);
  const center = size / 2;

  const trackColor = "currentColor";
  const progressColor = mode === "work" ? "#22d3ee" : "#34d399"; // cyan-400 / emerald-400

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s linear, stroke 0.4s ease" }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-mono font-bold tabular-nums text-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

// ── StudyTimer ────────────────────────────────────────────────────────────────

export function StudyTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === "work" ? WORK_SECONDS : BREAK_SECONDS;
  const fraction = secondsLeft / totalSeconds;

  // ── Session complete handler ──────────────────────────────────────────────

  const handleSessionComplete = useCallback((completedMode: Mode) => {
    setRunning(false);

    if (completedMode === "work") {
      toast.success("Session complete! Log your study time.", {
        description: "Time for a 5-minute break.",
        duration: 6000,
      });
      setMode("break");
      setSecondsLeft(BREAK_SECONDS);
    } else {
      toast("Break over! Ready to focus again?", {
        description: "Starting next work session.",
        duration: 4000,
      });
      setMode("work");
      setSecondsLeft(WORK_SECONDS);
    }
  }, []);

  // ── Tick ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Let the cleanup/effect handle mode switch after render
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // ── Detect timer reaching zero ────────────────────────────────────────────

  useEffect(() => {
    if (running && secondsLeft === 0) {
      handleSessionComplete(mode);
    }
  }, [secondsLeft, running, mode, handleSessionComplete]);

  // ── Controls ──────────────────────────────────────────────────────────────

  function handleStartPause() {
    setRunning((v) => !v);
  }

  function handleReset() {
    setRunning(false);
    setMode("work");
    setSecondsLeft(WORK_SECONDS);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const modeLabel = mode === "work" ? "Focus" : "Break";
  const modeColor =
    mode === "work" ? "text-cyan-400" : "text-emerald-400";

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4 flex flex-col items-center gap-3">
      {/* Mode label */}
      <p className={cn("text-xs font-semibold uppercase tracking-widest", modeColor)}>
        {modeLabel}
      </p>

      {/* Ring + countdown */}
      <TimerRing
        fraction={fraction}
        mode={mode}
        label={formatTime(secondsLeft)}
        size={120}
        strokeWidth={8}
      />

      {/* Session indicator dots */}
      <div className="flex gap-1.5" aria-label="25/5 Pomodoro cycle">
        <span
          className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            mode === "work" ? "bg-cyan-400" : "bg-muted/40"
          )}
        />
        <span
          className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            mode === "break" ? "bg-emerald-400" : "bg-muted/40"
          )}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-1">
        {/* Reset */}
        <button
          onClick={handleReset}
          aria-label="Reset timer"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/20 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Start / Pause */}
        <button
          onClick={handleStartPause}
          aria-label={running ? "Pause timer" : "Start timer"}
          className={cn(
            "flex h-9 w-24 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors",
            running
              ? "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
              : mode === "work"
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20"
              : "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
          )}
        >
          {running ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Start
            </>
          )}
        </button>
      </div>

      {/* Subtle descriptor */}
      <p className="text-[10px] text-muted-foreground/60">
        25 min work · 5 min break
      </p>
    </div>
  );
}
