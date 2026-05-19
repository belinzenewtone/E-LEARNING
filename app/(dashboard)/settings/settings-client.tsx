"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Shield, Target, AlertTriangle, Loader2,
  Eye, EyeOff, ChevronRight, Clock, BookOpen, Download, Zap,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getMoodEmoji, minutesToHours, truncate } from "@/lib/utils";
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
    <div className="p-4 sm:p-6 max-w-3xl space-y-5">
      {/* Compact profile header */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-2xl font-bold text-primary select-none">
          {displayAvatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">{user?.name}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Zap className="h-3 w-3" />{xpTotal.toLocaleString()} XP
          </span>
          <span className="text-[10px] text-muted-foreground">
            Member since {user ? formatDate(user.createdAt) : "—"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start gap-1 bg-muted/40 p-1 h-auto flex-wrap">
          <TabsTrigger value="profile" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" />Goals</TabsTrigger>
          <TabsTrigger value="study-log" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" />Study Log</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5 text-xs text-[var(--token-red)]"><AlertTriangle className="h-3.5 w-3.5" />Danger</TabsTrigger>
        </TabsList>

        {/* ── Profile ─────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="mt-4 space-y-5">
          <div className="space-y-5 rounded-xl border border-border bg-card p-5">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</Label>
              <div className="mt-2 flex gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm bg-muted/20" placeholder="Your name" />
                <Button onClick={handleProfileUpdate} disabled={isProfilePending || !name.trim()}>
                  {isProfilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avatar</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => setAvatar(emoji)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${
                      avatar === emoji ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}>
                    {emoji}
                  </button>
                ))}
                <button type="button" onClick={() => setAvatar(null)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                    avatar === null ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:bg-muted/40"
                  }`}>
                  {user?.name?.[0]?.toUpperCase() ?? "L"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">Pick an emoji or use your initial. Click Save to apply.</p>
            </div>
          </div>
        </TabsContent>

        {/* ── Goals ───────────────────────────────────────────────────────── */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          {goals.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Target className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No goals set yet.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{goal.title}</div>
                  {goal.description && <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>}
                  {goal.targetDate && <div className="text-xs text-muted-foreground mt-1">Target: {formatDate(goal.targetDate)}</div>}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {goal.track && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                      style={{ color: goal.track.color, borderColor: `${goal.track.color}40` }}>
                      {goal.track.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    goal.status === "completed" ? "text-[var(--token-emerald)] border-[var(--token-emerald)]/30" : "text-muted-foreground border-border"
                  }`}>
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
            <Button variant="outline" size="sm" asChild>
              <a href="/api/export/study-log" download>
                <Download className="h-3.5 w-3.5 mr-1.5" />Export CSV
              </a>
            </Button>
          </div>
          <StudyLogForm tracks={tracks} />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Sessions ({studyLogs.length}{studyLogs.length === 30 ? "+" : ""})
            </h3>
            {studyLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No sessions logged yet.</p>
            ) : (
              studyLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-lg">
                    {log.mood ? getMoodEmoji(log.mood) : "📚"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{formatDate(log.date)}</span>
                      {log.track && <><span>·</span><span>{log.track.name}</span></>}
                      <span>·</span>
                      <span className="font-semibold text-foreground">{minutesToHours(log.minutes)}</span>
                      {log.energy && <><span>·</span><span>Energy {log.energy}/5</span></>}
                    </div>
                    {log.learned && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{truncate(log.learned, 180)}</p>}
                    {log.blockers && <p className="mt-0.5 text-xs text-[var(--token-red)]/70 line-clamp-1">Blocker: {log.blockers}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Security ────────────────────────────────────────────────────── */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Link href="/settings/security"
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span>Login history &amp; session management</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Change Password</p>
            <Separator />
            <div className="grid gap-3 max-w-sm">
              {(
                [
                  { label: "Current password", value: currentPassword, setValue: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
                  { label: "New password",      value: newPassword,     setValue: setNewPassword,     show: showNew,     setShow: setShowNew     },
                  { label: "Confirm new",       value: confirmPassword, setValue: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
                ] as const
              ).map(({ label, value, setValue, show, setShow }) => (
                <div key={label} className="relative space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    type={show ? "text" : "password"}
                    placeholder={label}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`bg-muted/20 pr-10 ${label === "Confirm new" && value && value !== newPassword ? "border-red-400/60" : ""}`}
                  />
                  <button type="button" onClick={() => setShow((v: boolean) => !v)}
                    className="absolute right-3 bottom-2.5 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              ))}
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-400">Passwords do not match.</p>
              )}
            </div>
            <Button onClick={handlePasswordUpdate}
              disabled={isPasswordPending || !currentPassword || !newPassword || !confirmPassword}
              variant="outline" size="sm">
              {isPasswordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </div>
        </TabsContent>

        {/* ── Danger ──────────────────────────────────────────────────────── */}
        <TabsContent value="danger" className="mt-4">
          <div className="rounded-xl border border-[var(--token-red)]/20 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--token-red)]">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">Danger Zone</span>
            </div>
            <Separator className="bg-[var(--token-red)]/10" />
            <p className="text-sm text-muted-foreground">
              Resetting progress permanently deletes all XP events, study logs, lesson progress, notes, and submissions. This cannot be undone.
            </p>
            <Button variant="outline" size="sm"
              className="text-[var(--token-red)] border-[var(--token-red)]/30 hover:bg-[var(--token-red)]/10"
              onClick={handleReset} disabled={isResetPending}>
              {isResetPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset All Progress"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
