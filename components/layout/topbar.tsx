"use client";

import { Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { useNavData } from "./dashboard-shell";
import { CommandSearch } from "./command-search";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, breadcrumbs, actions }: TopbarProps) {
  const nav = useNavData();
  const { notifications, unreadCount, userId, userXp, streak } = nav;
  const level = Math.floor(userXp / 500) + 1;

  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;
  const hasTitle = !!title;

  return (
    <header className="h-12 border-b border-border bg-background sticky top-0 z-10 flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <MobileNav userXp={nav.userXp} streak={nav.streak} userName={nav.userName} />

      {/* Left area */}
      <div className="flex-1 min-w-0">
        {hasBreadcrumbs ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/30">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : hasTitle ? (
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="font-medium text-sm text-foreground truncate">{title}</h1>
            {subtitle && (
              <span className="text-xs text-muted-foreground hidden md:block truncate">{subtitle}</span>
            )}
          </div>
        ) : (
          <div className="hidden lg:block">
            <CommandSearch />
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* XP chip */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-foreground font-semibold">{userXp.toLocaleString()}</span>
          <span className="text-muted-foreground/60">XP</span>
        </div>

        {/* Streak chip */}
        {streak > 0 && (
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-border bg-muted/20 px-2 py-1 text-[11px] font-medium">
            <Flame className="h-3 w-3 text-[var(--token-amber)]" />
            <span className="text-[var(--token-amber)] font-semibold">{streak}d</span>
          </div>
        )}

        {actions}

        {/* Search on mobile/tablet (when not shown in left area) */}
        {!hasBreadcrumbs && !hasTitle && (
          <div className="lg:hidden">
            <CommandSearch />
          </div>
        )}
        {(hasBreadcrumbs || hasTitle) && (
          <div className="hidden sm:block lg:hidden">
            <CommandSearch />
          </div>
        )}

        <ThemeToggle />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} userId={userId} />
      </div>
    </header>
  );
}
