"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Shield, Target, AlertTriangle, Loader2,
  Eye, EyeOff, ChevronRight, Clock, BookOpen, Download, Zap,
} from "lucide-react";
import Link from "next/link";
import { cn, formatDate, getMoodEmoji, minutesToHours, truncate } from "@/lib/utils";
import { updateProfile, updatePassword, resetAllProgress } from "@/server/actions/settings";
import { StatCard } from "@/components/shared/stat-card";
import { StudyLogForm } from "@/app/(dashboard)/study-log/study-log-form";

const AVATAR_EMOJIS = ["🦁", "🐯", "🦊", "🐺", "🦉", "🦅", "🐢", "🐙", "🦋", "🌵", "🔥", "⚡", "🚀", "💡", "🎯", "🎨"];

type StudyLog = {
  id: string;
  date: Date;
  minutes: number;
  mood: string | null;
  energy: number | null;
  learned: string | null;
  blockers: string | null;
  track: { name: string; slug: string } | null;
};

interface SettingsClientProps {
  user: { name: string | null; email: string | null; createdAt: Date } | null;
  goals: {
    id: string;
    title: string;
    description: string | null;
    targetDate: Date | null;
    status: string;
    track: { name: string; color: string } | null;
  }[];
  xpTotal: number;
  studyLogs: StudyLog[];
  tracks: { id: string; name: string; slug: string }[];
  weekStats: { totalMinutes: number; weekMinutes: number; uniqueWeekDays: number };
}

export function SettingsClient({ user, goals, xpTotal, studyLogs, tracks, weekStats }: SettingsClientProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProfilePending, startProfile] = useTransition();
  const [isPasswordPending, startPassword] = useTransition();
  const [isResetPending, startReset] = useTransition();

  const displayAvatar = avatar ?? user?.name?.[0]?.toUpperCase() ?? "L";

  function handleProfileUpdate() {
    const formData = new FormData();
    formData.set("name", name);
    if (avatar) formData.set("avatar", avatar);
    startProfile(async () => {
      const result = await updateProfile(formData);
      if (result.success) toast.success("Profile updated.");
      else toast.error(result.error ?? "Failed to update profile.");
    });
  }

  function handlePasswordUpdate() {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("Please fill in all password fields."); return; }
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match."); return; }
    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    startPassword(async () => {
      const result = await updatePassword(formData);
      if (result.success) {
        toast.success("Password updated.");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error(result.error ?? "Failed to update password.");
      }
    });
  }

  function handleReset() {
    if (!confirm("WARNING: This will permanently delete ALL your progress, notes, study logs, and submissions. This cannot be undone.")) return;
    if (!confirm("Final confirmation: press OK to confirm.")) return;
    startReset(async () => {
      const result = await resetAllProgress();
      if (result.success) { toast.success("All progress reset."); window.location.href = "/dashboard"; }
      else toast.error("Failed to reset progress.");
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM // USER PREFERENCES
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground/80">Manage profile, goals, study log, and credentials.</p>
        </div>
      </div>

      {/* Profile header card */}
      <div data-slot="card" className="flex items-center gap-4 rounded-xl border border-border/80 bg-card/60 px-5 py-4 transition-all hover:shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-2xl font-bold text-primary select-none">
          {displayAvatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-foreground tracking-tight">{user?.name}</div>
          <div className="text-xs font-mono text-muted-foreground/70">{user?.email}</div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
            <Zap className="h-3 w-3" />{xpTotal.toLocaleString()} XP
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
            MEMBER SINCE {user ? formatDate(user.createdAt).toUpperCase() : "—"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start gap-1 bg-card/40 border border-border/80 p-1 h-auto flex-wrap rounded-lg">
          <TabsTrigger value="profile" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider"><User className="h-3.5 w-3.5" />PROFILE</TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider"><Target className="h-3.5 w-3.5" />GOALS</TabsTrigger>
          <TabsTrigger value="study-log" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider"><Clock className="h-3.5 w-3.5" />STUDY LOG</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider"><Shield className="h-3.5 w-3.5" />SECURITY</TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--token-red)]"><AlertTriangle className="h-3.5 w-3.5" />DANGER</TabsTrigger>
        </TabsList>

        {/* ── Profile ─────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="mt-4 space-y-5">
          <div data-slot="card" className="space-y-5 rounded-xl border border-border/80 bg-card/60 p-5">
            <div>
              <Label className="text-[10px] font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">DISPLAY NAME</Label>
              <div className="mt-2 flex gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm bg-muted/20" placeholder="Your name" />
                <Button
                  onClick={handleProfileUpdate}
                  disabled={isProfilePending || !name.trim()}
                  className="font-mono text-xs font-semibold uppercase tracking-wider"
                >
                  {isProfilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "SAVE"}
                </Button>
              </div>
            </div>
            <div className="border-t border-border/40 pt-5 space-y-3">
              <Label className="text-[10px] font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">AVATAR</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all",
                      avatar === emoji ? "border-primary bg-primary/10" : "border-border/80 bg-muted/20 hover:bg-muted/40"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all",
                    avatar === null ? "border-primary bg-primary/10" : "border-border/80 bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  {user?.name?.[0]?.toUpperCase() ?? "L"}
                </button>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">PICK EMOJI OR USE INITIAL · CLICK SAVE TO APPLY</p>
            </div>
          </div>
        </TabsContent>

        {/* ── Goals ───────────────────────────────────────────────────────── */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          {goals.length === 0 ? (
            <div data-slot="card" className="rounded-xl border border-border/80 bg-card/60 p-8 text-center">
              <Target className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground/80">No goals set yet.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} data-slot="card" className="flex items-start gap-3 rounded-xl border border-border/80 bg-card/60 p-4 transition-all hover:shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground tracking-tight">{goal.title}</div>
                  {goal.description && <div className="text-xs text-muted-foreground/80 mt-0.5">{goal.description}</div>}
                  {goal.targetDate && (
                    <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mt-1">
                      TARGET {formatDate(goal.targetDate).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {goal.track && (
                    <span
                      className="inline-flex text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{ color: goal.track.color, borderColor: `${goal.track.color}40`, backgroundColor: `${goal.track.color}10` }}
                    >
                      {goal.track.name}
                    </span>
                  )}
                  <span className={cn(
                    "text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border",
                    goal.status === "completed"
                      ? "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border-[var(--token-emerald)]/20"
                      : "bg-muted/40 text-muted-foreground border-border"
                  )}>
                    {goal.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Study Log ───────────────────────────────────────────────────── */}
        <TabsContent value="study-log" className="mt-4 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Total Hours" value={minutesToHours(weekStats.totalMinutes)} icon={Clock} color="primary" subtitle="All time" />
            <StatCard title="This Week" value={minutesToHours(weekStats.weekMinutes)} icon={Clock} color="success" subtitle="Minutes logged" />
            <StatCard title="Study Days" value={`${weekStats.uniqueWeekDays}/7`} icon={BookOpen} color="warning" subtitle="This week" />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
              <a href="/api/export/study-log" download>
                <Download className="h-3.5 w-3.5 mr-1.5" />EXPORT CSV
              </a>
            </Button>
          </div>
          <StudyLogForm tracks={tracks} />
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">
              RECENT SESSIONS ({studyLogs.length}{studyLogs.length === 30 ? "+" : ""})
            </h3>
            {studyLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground/80">No sessions logged yet.</p>
            ) : (
              <div className="divide-y divide-border/30 border border-border/80 rounded-xl bg-card/60">
                {studyLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-lg">
                      {log.mood ? getMoodEmoji(log.mood) : "📚"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                        <span className="font-bold text-foreground">{formatDate(log.date).toUpperCase()}</span>
                        {log.track && <><span>·</span><span>{log.track.name}</span></>}
                        <span>·</span>
                        <span className="font-bold text-foreground">{minutesToHours(log.minutes).toUpperCase()}</span>
                        {log.energy && <><span>·</span><span>E {log.energy}/5</span></>}
                      </div>
                      {log.learned && <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2">{truncate(log.learned, 180)}</p>}
                      {log.blockers && <p className="mt-0.5 text-xs text-[var(--token-red)]/70 line-clamp-1">Blocker: {log.blockers}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Security ────────────────────────────────────────────────────── */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Link
            href="/settings/security"
            className="flex items-center justify-between rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-xs hover:bg-muted/40 transition-colors"
            data-slot="card"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono uppercase tracking-wider text-foreground">LOGIN HISTORY // SESSION MANAGEMENT</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <div data-slot="card" className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">CHANGE PASSWORD</p>
            <div className="border-t border-border/40" />
            <div className="grid gap-3 max-w-sm">
              {(
                [
                  { label: "CURRENT PASSWORD", value: currentPassword, setValue: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, isConfirm: false },
                  { label: "NEW PASSWORD",      value: newPassword,     setValue: setNewPassword,     show: showNew,     setShow: setShowNew,     isConfirm: false },
                  { label: "CONFIRM NEW",       value: confirmPassword, setValue: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, isConfirm: true  },
                ] as const
              ).map(({ label, value, setValue, show, setShow, isConfirm }) => (
                <div key={label} className="relative space-y-1">
                  <Label className="text-[10px] font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">{label}</Label>
                  <Input
                    type={show ? "text" : "password"}
                    placeholder={label}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={cn(
                      "bg-muted/20 pr-10",
                      isConfirm && value && value !== newPassword && "border-[var(--token-red)]/60"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v: boolean) => !v)}
                    className="absolute right-3 bottom-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              ))}
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] font-mono text-[var(--token-red)] uppercase tracking-wider">PASSWORDS DO NOT MATCH</p>
              )}
            </div>
            <Button
              onClick={handlePasswordUpdate}
              disabled={isPasswordPending || !currentPassword || !newPassword || !confirmPassword}
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider"
            >
              {isPasswordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "UPDATE PASSWORD"}
            </Button>
          </div>
        </TabsContent>

        {/* ── Danger ──────────────────────────────────────────────────────── */}
        <TabsContent value="danger" className="mt-4">
          <div
            data-slot="card"
            className="rounded-xl border border-[var(--token-red)]/25 bg-card/60 p-5 space-y-4 border-l-2 border-l-[var(--token-red)]"
          >
            <div className="flex items-center gap-2 text-[var(--token-red)]">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest">DANGER ZONE // IRREVERSIBLE</span>
            </div>
            <div className="border-t border-[var(--token-red)]/10" />
            <p className="text-xs text-muted-foreground/80">
              Resetting progress permanently deletes all XP events, study logs, lesson progress, notes, and submissions. This cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-[var(--token-red)] border-[var(--token-red)]/30 hover:bg-[var(--token-red)]/10 font-mono text-xs uppercase tracking-wider"
              onClick={handleReset}
              disabled={isResetPending}
            >
              {isResetPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "RESET ALL PROGRESS"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
