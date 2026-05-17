"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Target, AlertTriangle, Loader2, Eye, EyeOff, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { updateProfile, updatePassword, resetAllProgress } from "@/server/actions/settings";

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
}

const AVATAR_EMOJIS = ["🦁", "🐯", "🦊", "🐺", "🦉", "🦅", "🐢", "🐙", "🦋", "🌵", "🔥", "⚡", "🚀", "💡", "🎯", "🎨"];

export function SettingsClient({ user, goals, xpTotal }: SettingsClientProps) {
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
      if (result.success) {
        toast.success("Profile updated.");
      } else {
        toast.error(result.error ?? "Failed to update profile.");
      }
    });
  }

  function handlePasswordUpdate() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    startPassword(async () => {
      const result = await updatePassword(formData);
      if (result.success) {
        toast.success("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error ?? "Failed to update password.");
      }
    });
  }

  function handleReset() {
    if (
      !confirm(
        "WARNING: This will permanently delete ALL your progress, notes, study logs, and submissions. This cannot be undone. Are you absolutely sure?"
      )
    )
      return;
    if (!confirm("Final confirmation: type RESET to confirm (just press OK if you're sure).")) return;

    startReset(async () => {
      const result = await resetAllProgress();
      if (result.success) {
        toast.success("All progress has been reset.");
        window.location.href = "/dashboard";
      } else {
        toast.error("Failed to reset progress.");
      }
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {displayAvatar}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-lg">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Member since {user ? formatDate(user.createdAt) : "—"}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex gap-3 text-sm">
            <span className="inline-flex items-center rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {xpTotal.toLocaleString()} XP
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Personal Learning OS
            </span>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Display Name
            </Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-sm bg-muted/20"
                placeholder="Your name"
              />
              <Button onClick={handleProfileUpdate} disabled={isProfilePending || !name.trim()}>
                {isProfilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avatar Emoji
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${
                    avatar === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAvatar(null)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                  avatar === null
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/20 hover:border-border hover:bg-muted/40"
                }`}
              >
                {user?.name?.[0]?.toUpperCase() ?? "L"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select an emoji or use your name initial. Click Save to apply.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals set yet.</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{goal.title}</div>
                  {goal.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>
                  )}
                  {goal.targetDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {formatDate(goal.targetDate)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {goal.track && (
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: goal.track.color, borderColor: `${goal.track.color}40` }}
                    >
                      {goal.track.name}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      goal.status === "completed"
                        ? "text-[var(--token-emerald)] border-[var(--token-emerald)]/30"
                        : "text-muted-foreground border-border"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Authentication uses NextAuth credentials. Your password is stored as a bcrypt hash.
          </p>
          <Link
            href="/settings/security"
            className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span>Login history &amp; session management</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Change Password
            </Label>
            <div className="grid gap-3">
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-muted/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-muted/20 pr-10 ${confirmPassword && confirmPassword !== newPassword ? "border-red-400/60 focus:border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-400">Passwords do not match.</p>
              )}
            </div>
            <Button
              onClick={handlePasswordUpdate}
              disabled={isPasswordPending || !currentPassword || !newPassword || !confirmPassword}
              variant="outline"
            >
              {isPasswordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-400/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[var(--token-red)]">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Resetting progress will delete all your XP events, study logs, lesson progress, notes, and submissions. This action cannot be undone.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-[var(--token-red)] border-[var(--token-red)]/30 hover:bg-[var(--token-red)]/10"
            onClick={handleReset}
            disabled={isResetPending}
          >
            {isResetPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset All Progress"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
