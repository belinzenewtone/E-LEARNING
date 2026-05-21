"use client";

import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  children: React.ReactNode; // center content
}

export function LessonPanelLayout({
  leftPanel,
  rightPanel,
  children,
}: LessonPanelLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const toggleBtn =
    "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors shrink-0";

  const gridClass = cn(
    "grid gap-6",
    leftOpen && rightOpen  && "xl:grid-cols-[240px_minmax(0,1fr)_300px]",
    leftOpen && !rightOpen && "xl:grid-cols-[240px_minmax(0,1fr)]",
    !leftOpen && rightOpen && "xl:grid-cols-[minmax(0,1fr)_300px]",
    !leftOpen && !rightOpen && "xl:grid-cols-1",
  );

  return (
    <div className={gridClass}>
      {/* LEFT panel */}
      {leftOpen && (
        <aside className="xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="flex justify-end mb-1">
            <button
              className={toggleBtn}
              onClick={() => setLeftOpen(false)}
              title="Collapse panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          {leftPanel}
        </aside>
      )}

      {/* CENTER */}
      <main className="space-y-5 min-w-0">
        {/* Re-open buttons when panels are closed */}
        {(!leftOpen || !rightOpen) && (
          <div className="flex items-center justify-between mb-1">
            {!leftOpen ? (
              <button
                className={toggleBtn}
                onClick={() => setLeftOpen(true)}
                title="Expand left panel"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            ) : (
              <span />
            )}
            {!rightOpen && (
              <button
                className={toggleBtn}
                onClick={() => setRightOpen(true)}
                title="Expand right panel"
              >
                <PanelRightOpen className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {children}
      </main>

      {/* RIGHT panel */}
      {rightOpen && (
        <aside className="xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="flex justify-between items-center mb-1">
            <button
              className={toggleBtn}
              onClick={() => setRightOpen(false)}
              title="Collapse panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
