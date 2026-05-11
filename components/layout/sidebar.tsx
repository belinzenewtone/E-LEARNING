"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Map,
  Calendar,
  CalendarRange,
  FileText,
  ClipboardList,
  NotebookPen,
  Clock,
  BarChart3,
  Briefcase,
  Settings,
  LogOut,
  Zap,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/roadmap",   label: "Roadmap",   icon: Map             },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/weeks",       label: "Weekly Sprints", icon: Calendar      },
      { href: "/calendar",    label: "Calendar",       icon: CalendarRange },
      { href: "/lessons",     label: "Lessons",        icon: FileText      },
      { href: "/assignments", label: "Assignments",    icon: ClipboardList },
    ],
  },
  {
    label: "Track",
    items: [
      { href: "/notes",     label: "Notes",     icon: NotebookPen },
      { href: "/study-log", label: "Study Log", icon: Clock       },
      { href: "/analytics", label: "Analytics", icon: BarChart3   },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    ],
  },
];

interface SidebarProps {
  userXp?: number;
  streak?: number;
  userName?: string;
}

export function Sidebar({ userXp = 0, streak = 0, userName = "Learner" }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  const level = Math.floor(userXp / 500) + 1;

  return (
    <aside className="flex w-60 flex-col h-screen bg-sidebar border-r border-sidebar-border">

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 shrink-0">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-none text-sidebar-foreground">Learning OS</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{userName}</p>
        </div>
      </div>

      <div className="mx-3 h-px bg-sidebar-border shrink-0" />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="px-2 py-2 space-y-3 shrink-0">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {section.label}
            </p>
            <div className="space-y-px">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Icon className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      active ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-accent-foreground"
                    )} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 h-px bg-sidebar-border shrink-0" />

      {/* ── Settings + Sign out (right after nav) ──────────────────────────── */}
      <div className="px-2 py-1.5 space-y-px shrink-0">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
            isActive("/settings")
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground/50" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 px-2.5 py-1.5 h-auto text-[13px] font-medium text-sidebar-foreground/65 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-colors"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-3.5 w-3.5 text-muted-foreground/50" />
          Sign out
        </Button>
      </div>

      {/* Spacer — absorbs remaining height so XP strip pins to bottom */}
      <div className="flex-1" />

      <div className="mx-3 h-px bg-sidebar-border shrink-0" />

      {/* ── XP / Streak footer strip ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          <Zap className="h-3 w-3" />
          {userXp.toLocaleString()} XP
        </span>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <span className="text-[11px] font-semibold text-muted-foreground/60">Lv {level}</span>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400/80">
          <Flame className="h-3 w-3" />
          {streak}d
        </span>
      </div>

    </aside>
  );
}
