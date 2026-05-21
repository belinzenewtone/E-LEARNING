"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, AlertTriangle, Lock, Ban, Key, RefreshCw, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
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
  if (!ua) return "UNKNOWN";
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    if (/iphone/i.test(ua)) return "IPHONE";
    if (/ipad/i.test(ua)) return "IPAD";
    if (/android/i.test(ua)) return "ANDROID";
    return "MOBILE";
  }
  if (/windows/i.test(ua)) return "WINDOWS";
  if (/macintosh|mac os/i.test(ua)) return "MACOS";
  if (/linux/i.test(ua)) return "LINUX";
  return "DESKTOP";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "";
  if (/firefox/i.test(ua)) return "FIREFOX";
  if (/edg\//i.test(ua)) return "EDGE";
  if (/chrome/i.test(ua)) return "CHROME";
  if (/safari/i.test(ua)) return "SAFARI";
  if (/curl/i.test(ua)) return "CURL";
  return "";
}

const EVENT_CONFIG: Record<
  EventType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  LOGIN_SUCCESS:      { label: "LOGIN OK",             icon: CheckCircle2, color: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/10" },
  LOGIN_FAILURE:      { label: "LOGIN FAILURE",        icon: XCircle,      color: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/10" },
  LOGIN_LOCKED:       { label: "ACCOUNT LOCKED",       icon: Lock,         color: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10" },
  LOGIN_RATE_LIMITED: { label: "RATE LIMITED",         icon: Ban,          color: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10" },
  LOGOUT:             { label: "SIGNED OUT",           icon: LogOut,       color: "text-muted-foreground",       bg: "bg-muted/50" },
  PASSWORD_CHANGE:    { label: "PASSWORD CHANGED",     icon: Key,          color: "text-[var(--token-cyan)]",    bg: "bg-[var(--token-cyan)]/10" },
  DATA_EXPORT:        { label: "DATA EXPORTED",        icon: Shield,       color: "text-[var(--token-purple)]",  bg: "bg-[var(--token-purple)]/10" },
  SESSION_REVOKED:    { label: "SESSIONS REVOKED",     icon: RefreshCw,    color: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/10" },
};

const FALLBACK_CONFIG = { label: "SECURITY EVENT", icon: Shield, color: "text-muted-foreground", bg: "bg-muted/50" };

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM // SECURITY AUDIT
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Security</h1>
          <p className="text-xs text-muted-foreground/80">Login history, session control, and event audit log.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-emerald)]">
          <CardContent className="pt-4 pb-4">
            <div className="font-mono text-2xl font-bold text-[var(--token-emerald)]">{stats.successes}</div>
            <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70 mt-1">LOGINS // 30D</div>
          </CardContent>
        </Card>
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-red)]">
          <CardContent className="pt-4 pb-4">
            <div className="font-mono text-2xl font-bold text-[var(--token-red)]">{stats.failures}</div>
            <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70 mt-1">FAILURES // 30D</div>
          </CardContent>
        </Card>
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl border-l-2 border-l-primary">
          <CardContent className="pt-4 pb-4">
            <div className="font-mono text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70 mt-1">TOTAL EVENTS</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
        <CardHeader>
          <CardTitle className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            SESSION MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground/80">
            Revoking all sessions will force sign-out on every other device. Your current session remains active until you log out manually.
          </p>
          {showConfirm && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--token-red)]/10 border border-[var(--token-red)]/25 text-xs text-[var(--token-red)]">
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
              className={cn(
                "border-border hover:bg-muted text-xs font-mono uppercase tracking-wider",
                showConfirm && "text-[var(--token-red)] border-[var(--token-red)]/40 hover:bg-[var(--token-red)]/10"
              )}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showConfirm ? (
                "CONFIRM // REVOKE ALL"
              ) : (
                "REVOKE ALL SESSIONS"
              )}
            </Button>
            {showConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
                className="text-xs font-mono uppercase tracking-wider"
              >
                CANCEL
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
        <CardHeader>
          <CardTitle className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            SECURITY EVENT LOG
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground/80">No security events recorded yet.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {events.map((event) => {
                const cfg = EVENT_CONFIG[event.type as EventType] ?? FALLBACK_CONFIG;
                const Icon = cfg.icon;
                const device = parseDevice(event.userAgent);
                const browser = parseBrowser(event.userAgent);
                const deviceLabel = browser ? `${device} · ${browser}` : device;

                return (
                  <div key={event.id} className="flex items-start gap-3 py-2.5 hover:bg-muted/40 transition-colors px-1">
                    <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60", cfg.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={cn("text-[10px] font-mono font-semibold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">{deviceLabel}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                        <span>{event.ip ?? "IP UNKNOWN"}</span>
                        <span title={format(new Date(event.createdAt), "PPpp")}>
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }).toUpperCase()}
                        </span>
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
