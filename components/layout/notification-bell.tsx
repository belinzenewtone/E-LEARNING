"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, timeAgo, truncate } from "@/lib/utils";
import { markNotificationRead, markAllRead } from "@/server/actions/notifications";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  href: string | null;
  createdAt: Date;
};

interface NotificationBellProps {
  notifications: NotificationItem[];
  unreadCount: number;
  userId: string;
}

const TYPE_META: Record<string, { label: string; color: string; dot: string }> = {
  overdue_assignment: { label: "OVERDUE", color: "text-[var(--token-red)]",    dot: "bg-[var(--token-red)]"    },
  streak_risk:        { label: "STREAK",  color: "text-[var(--token-amber)]",  dot: "bg-[var(--token-amber)]"  },
  week_complete:      { label: "DONE",    color: "text-[var(--token-emerald)]", dot: "bg-[var(--token-emerald)]" },
  milestone:          { label: "MILESTONE", color: "text-primary",             dot: "bg-primary"               },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? { label: "INFO", color: "text-muted-foreground", dot: "bg-muted-foreground/40" };
}

export function NotificationBell({
  notifications,
  unreadCount,
  userId,
}: NotificationBellProps) {
  // Deduplicate by id on init to guard against any upstream duplicates
  const [items, setItems] = useState<NotificationItem[]>(() => {
    const seen = new Set<string>();
    return notifications.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  });
  const [count, setCount] = useState(unreadCount);
  const [isPending, startTransition] = useTransition();

  const visible = items.slice(0, 10);

  function handleRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setCount((prev) => Math.max(0, prev - 1));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllRead(userId);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setCount(0);
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--token-red)] text-[9px] font-bold text-white leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        alignOffset={-4}
        sideOffset={8}
        className="w-[340px] p-0 shadow-lg border border-border/80 bg-card"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/80 uppercase">
              NOTIFICATIONS
            </span>
            {count > 0 && (
              <span className="inline-flex items-center rounded border border-[var(--token-red)]/30 bg-[var(--token-red)]/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[var(--token-red)] uppercase tracking-wider">
                {count} new
              </span>
            )}
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* ── List ────────────────────────────────────────────────── */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <BellOff className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/50">
              All clear
            </p>
            <p className="text-[10px] text-muted-foreground/40">
              No notifications right now.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[380px]">
            <ul>
              {visible.map((n, i) => {
                const meta = getMeta(n.type);
                const row = (
                  <div
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors",
                      "border-b border-border/30 last:border-b-0",
                      !n.read ? "bg-primary/[0.03] hover:bg-muted/30" : "hover:bg-muted/20",
                      isPending && "pointer-events-none opacity-60"
                    )}
                    onClick={() => { if (!n.read) handleRead(n.id); }}
                  >
                    {/* Type dot */}
                    <span className={cn("mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full", meta.dot, n.read && "opacity-25")} />

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-[9px] font-mono font-bold tracking-widest uppercase", meta.color)}>
                          {meta.label}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground/40 ml-auto shrink-0">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-[12px] font-medium leading-snug",
                        n.read ? "text-muted-foreground/70" : "text-foreground"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                        {truncate(n.body, 100)}
                      </p>
                    </div>

                    {/* Unread pip */}
                    {!n.read && (
                      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );

                return (
                  <li key={`${n.id}-${i}`}>
                    {n.href ? (
                      <Link href={n.href} className="block">
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        {visible.length > 0 && (
          <div className="border-t border-border/40 px-3 py-1.5">
            <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
              SHOWING {visible.length} OF {items.length}
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
