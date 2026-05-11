"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { useNavData } from "./dashboard-shell";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, breadcrumbs, actions }: TopbarProps) {
  const nav = useNavData();

  return (
    <header className="h-14 border-b border-border/60 bg-background/90 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 sm:px-6 gap-3">
      {/* Mobile hamburger — only visible on small screens */}
      <MobileNav userXp={nav.userXp} streak={nav.streak} userName={nav.userName} />

      {/* Title / breadcrumb area */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/40">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-semibold truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="font-semibold text-base text-foreground truncate">{title}</h1>
            {subtitle && (
              <span className="text-xs text-muted-foreground hidden md:block truncate">{subtitle}</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {actions}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
          <a href="https://github.com/anthropics/claude-code/issues" target="_blank" rel="noopener noreferrer" title="Help & Feedback">
            <HelpCircle className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
