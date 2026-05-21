"use client";

import { useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard",   label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap",     label: "Roadmap",   icon: Map             },
  { href: "/weeks",       label: "Sprints",   icon: CalendarRange   },
  { href: "/lessons",     label: "Lessons",   icon: FileText        },
  { href: "/review",      label: "Review",    icon: Brain           },
  { href: "/assignments", label: "Tasks",     icon: ClipboardList   },
  { href: "/notes",       label: "Notes",     icon: NotebookPen     },
  { href: "/analytics",   label: "Analytics", icon: BarChart3       },
];

interface SidebarProps {
  userXp?: number;
  streak?: number;
  userName?: string;
}

export function Sidebar({ userXp = 0, streak = 0, userName = "Learner" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  void userXp;
  void streak;
  void userName;

  const toggleBtn =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors";

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex shrink-0 flex-col h-screen bg-sidebar border-r border-sidebar-border/80 py-3",
          collapsed ? "w-14" : "w-fit"
        )}
      >
        {/* ── Brand ─────────────────────────────────────────────── */}
        {collapsed ? (
          <div className="flex flex-col items-center px-2 mb-3 gap-1 shrink-0">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-all hover:shadow-sm"
            >
              <BookOpen className="h-4 w-4 text-primary" />
            </Link>
            <button
              onClick={() => setCollapsed(false)}
              className={toggleBtn}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center px-4 mb-3 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-all group-hover:shadow-sm">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="font-mono text-[11px] font-bold tracking-widest text-foreground/70 uppercase leading-tight">
                Learning<br />
                <span className="text-primary">// OS</span>
              </span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className={cn(toggleBtn, "ml-auto")}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mx-4 h-px bg-sidebar-border/60 shrink-0 mb-2" />

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "group relative flex items-center justify-center rounded-lg p-2.5 w-full transition-colors duration-100",
                        active
                          ? "text-sidebar-foreground bg-muted/30"
                          : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-muted/20"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-foreground/70"
                      )} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg pl-3 pr-4 py-2.5 w-full transition-colors duration-100",
                  active
                    ? "text-sidebar-foreground bg-muted/30"
                    : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-muted/20"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-foreground/70"
                )} />
                <span className={cn(
                  "text-[13px] font-medium leading-none",
                  active ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground/80"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 h-px bg-sidebar-border/60 shrink-0 mb-2" />

        {/* ── Bottom actions ─────────────────────────────────────── */}
        <div className="flex flex-col gap-2 w-full px-2">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      "group relative flex items-center justify-center rounded-lg p-2.5 w-full transition-colors duration-100",
                      isActive("/settings")
                        ? "text-sidebar-foreground bg-muted/30"
                        : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-muted/20"
                    )}
                  >
                    {isActive("/settings") && (
                      <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Settings className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive("/settings") ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-foreground/70"
                    )} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="group relative flex items-center justify-center rounded-lg p-2.5 w-full transition-colors duration-100 text-sidebar-foreground/40 hover:text-[var(--token-red)] hover:bg-muted/20"
                  >
                    <LogOut className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-[var(--token-red)]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                href="/settings"
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg pl-3 pr-4 py-2.5 w-full transition-colors duration-100",
                  isActive("/settings")
                    ? "text-sidebar-foreground bg-muted/30"
                    : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-muted/20"
                )}
              >
                {isActive("/settings") && (
                  <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Settings className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive("/settings") ? "text-primary" : "text-muted-foreground/50 group-hover:text-sidebar-foreground/70"
                )} />
                <span className={cn(
                  "text-[13px] font-medium leading-none",
                  isActive("/settings") ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground/80"
                )}>
                  Settings
                </span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group relative flex items-center gap-3 rounded-lg pl-3 pr-4 py-2.5 w-full transition-colors duration-100 text-sidebar-foreground/40 hover:text-[var(--token-red)] hover:bg-muted/20"
              >
                <LogOut className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-[var(--token-red)]" />
                <span className="text-[13px] font-medium leading-none group-hover:text-[var(--token-red)]">
                  Sign out
                </span>
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
