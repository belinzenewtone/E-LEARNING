"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, LogIn, LogOut, AlertTriangle, Lock, Ban, Key, RefreshCw, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { revokeAllSessions } from "@/server/actions/settings";

type EventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGIN_LOCKED"
  | "LOGIN_RATE_LIMITED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "DATA_EXPORT"
  | "SESSION_REVOKED";

interface SecurityEvent {
  id: string;
  type: string;
  ip: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: Date;
}

interface Stats {
  failures: number;
  successes: number;
  total: number;
}

interface SecurityClientProps {
  events: SecurityEvent[];
  stats: Stats;
}

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    if (/iphone/i.test(ua)) return "iPhone";
    if (/ipad/i.test(ua)) return "iPad";
    if (/android/i.test(ua)) return "Android";
    return "Mobile";
  }
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Desktop";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/curl/i.test(ua)) return "curl";
  return "";
}

const EVENT_CONFIG: Record<
  EventType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  LOGIN_SUCCESS:      { label: "Successful login",     icon: CheckCircle2, color: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/10" },
  LOGIN_FAILURE:      { label: "Failed login attempt", icon: XCircle,      color: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/10" },
  LOGIN_LOCKED:       { label: "Account locked",       icon: Lock,         color: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10" },
  LOGIN_RATE_LIMITED: { label: "Rate limited",         icon: Ban,          color: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10" },
  LOGOUT:             { label: "Signed out",           icon: LogOut,       color: "text-muted-foreground",       bg: "bg-muted/50" },
  PASSWORD_CHANGE:    { label: "Password changed",     icon: Key,          color: "text-[var(--token-cyan)]",    bg: "bg-[var(--token-cyan)]/10" },
  DATA_EXPORT:        { label: "Data exported",        icon: Shield,       color: "text-[var(--token-purple)]",  bg: "bg-[var(--token-purple)]/10" },
  SESSION_REVOKED:    { label: "All sessions revoked", icon: RefreshCw,    color: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/10" },
};

const FALLBACK_CONFIG = { label: "Security event", icon: Shield, color: "text-muted-foreground", bg: "bg-muted/50" };

export function SecurityClient({ events, stats }: SecurityClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleRevokeAll() {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    startTransition(async () => {
      const result = await revokeAllSessions();
      if (result.success) {
        toast.success("All other sessions revoked. You'll need to log in again on other devices.");
        setShowConfirm(false);
        router.refresh();
      } else {
        toast.error("Failed to revoke sessions.");
      }
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-[var(--token-emerald)]">{stats.successes}</div>
            <div className="text-xs text-muted-foreground mt-1">Successful logins (30d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-[var(--token-red)]">{stats.failures}</div>
            <div className="text-xs text-muted-foreground mt-1">Failed attempts (30d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total events logged</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Revoking all sessions will force sign-out on every other device. Your current session remains active until you log out manually.
          </p>
          {showConfirm && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--token-red)]/10 border border-[var(--token-red)]/20 text-sm text-[var(--token-red)]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>This will immediately invalidate all existing sessions. Click again to confirm.</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAll}
              disabled={isPending}
              className={showConfirm ? "text-[var(--token-red)] border-[var(--token-red)]/40 hover:bg-[var(--token-red)]/10" : ""}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showConfirm ? (
                "Confirm — Revoke All Sessions"
              ) : (
                "Revoke All Sessions"
              )}
            </Button>
            {showConfirm && (
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Security Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {events.map((event, i) => {
                const cfg = EVENT_CONFIG[event.type as EventType] ?? FALLBACK_CONFIG;
                const Icon = cfg.icon;
                const device = parseDevice(event.userAgent);
                const browser = parseBrowser(event.userAgent);
                const deviceLabel = browser ? `${device} · ${browser}` : device;

                return (
                  <div key={event.id}>
                    {i > 0 && <Separator className="my-1" />}
                    <div className="flex items-start gap-3 py-2">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-muted-foreground">{deviceLabel}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{event.ip ?? "IP unknown"}</span>
                          <span title={format(new Date(event.createdAt), "PPpp")}>
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
