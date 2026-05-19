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
  BarChart3,
  Settings,
  LogOut,
  Brain,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard",   label: "Home",    icon: LayoutDashboard },
  { href: "/roadmap",     label: "Roadmap", icon: Map             },
  { href: "/weeks",       label: "Sprints", icon: CalendarRange   },
  { href: "/lessons",     label: "Lessons", icon: FileText        },
  { href: "/review",      label: "Review",  icon: Brain           },
  { href: "/assignments", label: "Tasks",   icon: ClipboardList   },
  { href: "/notes",       label: "Notes",   icon: NotebookPen     },
  { href: "/analytics",   label: "Stats",   icon: BarChart3       },
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
    <TooltipProvider delayDuration={300}>
      <aside className="flex w-16 flex-col h-screen bg-sidebar border-r border-sidebar-border items-center py-3">

        {/* ── Brand ──────────────────────────────────────────────────────────── */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0 mb-3"
            >
              <BookOpen className="h-4 w-4 text-primary" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-1">Personal Learning OS</TooltipContent>
        </Tooltip>

        <div className="w-8 h-px bg-sidebar-border shrink-0 mb-2" />

        {/* ── Navigation ─────────────────────────────────────────────────────── */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
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
                    <span className="text-[10px] font-medium leading-none">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-1">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="w-8 h-px bg-sidebar-border shrink-0 mb-2" />

        {/* ── Bottom actions ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 w-full px-2">
          <Tooltip>
            <TooltipTrigger asChild>
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
                <span className="text-[10px] font-medium leading-none">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-1">Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 w-full transition-colors duration-100 text-sidebar-foreground/40 hover:text-[var(--token-red)]"
              >
                <LogOut className="h-[18px] w-[18px] text-muted-foreground/50 group-hover:text-[var(--token-red)]" />
                <span className="text-[10px] font-medium leading-none">Exit</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-1">Sign out</TooltipContent>
          </Tooltip>
        </div>

      </aside>
    </TooltipProvider>
  );
}
