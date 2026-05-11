"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
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

function typeColor(type: string): string {
  switch (type) {
    case "overdue_assignment":
      return "bg-[var(--token-red)]";
    case "streak_risk":
      return "bg-[var(--token-amber)]";
    case "week_complete":
      return "bg-[var(--token-emerald)]";
    case "milestone":
      return "bg-primary";
    default:
      return "bg-muted-foreground/40";
  }
}

export function NotificationBell({
  notifications,
  unreadCount,
  userId,
}: NotificationBellProps) {
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [count, setCount] = useState(unreadCount);
  const [isPending, startTransition] = useTransition();

  const visible = items.slice(0, 10);

  function handleRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
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
          "relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground",
          "hover:bg-accent hover:text-foreground transition-colors"
        )}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        alignOffset={-4}
        className="w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">
            Notifications
            {count > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--token-red)]">
                {count} new
              </span>
            )}
          </span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm font-medium text-muted-foreground">
              All caught up!
            </p>
            <p className="text-xs text-muted-foreground/60">
              No notifications right now.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <ul className="divide-y divide-border/40">
              {visible.map((n) => {
                const content = (
                  <div
                    className={cn(
                      "flex cursor-pointer items-start gap-3 px-3 py-3 transition-colors hover:bg-muted/30",
                      !n.read && "bg-primary/3"
                    )}
                    onClick={() => {
                      if (!n.read) handleRead(n.id);
                    }}
                  >
                    {/* Colored dot */}
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        typeColor(n.type),
                        n.read && "opacity-30"
                      )}
                    />

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[13px] font-medium leading-snug",
                          n.read
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {truncate(n.body, 90)}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/50">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!n.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} className="block">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
