"use client";

import { Zap, Flame, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { useNavData } from "./dashboard-shell";
import { CommandSearch } from "./command-search";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, breadcrumbs, actions }: TopbarProps) {
  const nav = useNavData();
  const { notifications, unreadCount, userId, userXp, streak, userName } = nav;
  const router = useRouter();

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

        {actions}

        <ThemeToggle />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} userId={userId} />

        {/* Profile avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-primary/10 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Profile menu"
          >
            {userName.charAt(0).toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="pb-1">
              <p className="font-medium text-sm text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" />
                  {userXp.toLocaleString()} XP
                </span>
                {streak > 0 && (
                  <span className="flex items-center gap-0.5 text-[11px] text-[var(--token-amber)]">
                    <Flame className="h-3 w-3" />
                    {streak}d streak
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
