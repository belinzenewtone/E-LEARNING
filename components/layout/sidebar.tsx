"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Map,
  CalendarRange,
  FileText,
  ClipboardList,
  NotebookPen,
  Clock,
  BarChart3,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/roadmap",   label: "Roadmap",   icon: Map             },
  { href: "/weeks",       label: "Sprints", icon: CalendarRange },
  { href: "/lessons",     label: "Lessons", icon: FileText      },
  { href: "/assignments", label: "Tasks",   icon: ClipboardList },
  { href: "/notes",     label: "Notes",     icon: NotebookPen },
  { href: "/study-log", label: "Log",       icon: Clock       },
  { href: "/analytics", label: "Stats",     icon: BarChart3   },
  { href: "/portfolio", label: "Work",      icon: Briefcase   },
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

  return (
    <aside className="flex w-16 flex-col h-screen bg-sidebar border-r border-sidebar-border items-center py-3">

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <Link
        href="/dashboard"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0 mb-4"
      >
        <BookOpen className="h-4 w-4 text-primary" />
      </Link>

      <div className="w-8 h-px bg-sidebar-border shrink-0 mb-2" />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 w-full transition-colors duration-100",
                active
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon className={cn(
                "h-[18px] w-[18px] shrink-0",
                active ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-foreground/70"
              )} />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="w-8 h-px bg-sidebar-border shrink-0 mb-2" />

      {/* ── Bottom actions ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <Link
          href="/settings"
          className={cn(
            "group relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 w-full transition-colors duration-100",
            isActive("/settings")
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
          )}
        >
          {isActive("/settings") && (
            <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <Settings className="h-[18px] w-[18px] text-muted-foreground/50 group-hover:text-sidebar-foreground/70" />
          <span className="text-[9px] font-medium leading-none">Settings</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 w-full transition-colors duration-100 text-sidebar-foreground/40 hover:text-[var(--token-red)]"
          title="Sign out"
        >
          <LogOut className="h-[18px] w-[18px] text-muted-foreground/50 group-hover:text-[var(--token-red)]" />
          <span className="text-[9px] font-medium leading-none">Exit</span>
        </button>
      </div>

    </aside>
  );
}
