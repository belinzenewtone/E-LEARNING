"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  emoji: string | null;
  level: number;
}

interface LessonTocProps {
  /**
   * The slug of the lesson — used to scope localStorage for section
   * completion checkmarks so they persist per-lesson.
   */
  lessonSlug: string;
  /**
   * CSS selector that identifies the container the headings live inside.
   * The TOC only picks up headings from this scope so it doesn't grab
   * unrelated headings from sidebars or other lesson components.
   */
  contentSelector?: string;
}

const EMOJI_REGEX = /^(\p{Extended_Pictographic}(?:️)?(?:‍\p{Extended_Pictographic}(?:️)?)*)\s+/u;

function parseHeading(text: string): { emoji: string | null; clean: string } {
  const match = text.match(EMOJI_REGEX);
  if (match) {
    return { emoji: match[1], clean: text.slice(match[0].length).trim() };
  }
  return { emoji: null, clean: text };
}

export function LessonToc({ lessonSlug, contentSelector = "[data-lesson-body]" }: LessonTocProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const storageKey = `lesson-sections-${lessonSlug}`;

  // Load saved completion state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedIds(new Set(JSON.parse(saved) as string[]));
      }
    } catch {
      // ignore parse errors — start fresh
    }
  }, [storageKey]);

  // Build TOC by scanning headings in the lesson body
  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>("h2, h3"));
    const next: TocItem[] = headings
      .filter((h) => h.id)
      .map((h) => {
        const { emoji, clean } = parseHeading(h.textContent ?? "");
        return {
          id: h.id,
          text: clean,
          emoji,
          level: h.tagName === "H2" ? 2 : 3,
        };
      });
    setItems(next);
  }, [contentSelector, lessonSlug]);

  // Track active heading using IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost heading that has crossed into view
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  const toggleComplete = useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {
          // ignore quota errors
        }
        return next;
      });
    },
    [storageKey]
  );

  const handleClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  // Only count completion against h2 headings (the major sections)
  const h2Items = items.filter((i) => i.level === 2);
  const completedH2Count = h2Items.filter((i) => completedIds.has(i.id)).length;
  const percent = h2Items.length > 0 ? Math.round((completedH2Count / h2Items.length) * 100) : 0;

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            On This Page
          </div>
          <span className="text-xs font-semibold text-foreground/80">
            {percent}%
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-[var(--token-emerald)] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <nav className="max-h-[60vh] overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isCompleted = completedIds.has(item.id);
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <div className="group flex items-start gap-1.5">
                  {item.level === 2 ? (
                    <button
                      type="button"
                      onClick={() => toggleComplete(item.id)}
                      aria-label={isCompleted ? "Mark section incomplete" : "Mark section complete"}
                      className={cn(
                        "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all",
                        isCompleted
                          ? "border-[var(--token-emerald)] bg-[var(--token-emerald)] text-white"
                          : "border-border bg-background hover:border-[var(--token-emerald)]/60"
                      )}
                    >
                      {isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                  ) : (
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-border" />
                  )}
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(item.id, e)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs leading-snug transition-colors",
                      item.level === 3 && "pl-3 text-[11px]",
                      isActive
                        ? "bg-[var(--token-cyan)]/10 font-medium text-[var(--token-cyan)]"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                      isCompleted && !isActive && "text-foreground/60 line-through decoration-[1px]"
                    )}
                  >
                    {item.emoji && (
                      <span className="mr-1" aria-hidden>
                        {item.emoji}
                      </span>
                    )}
                    {item.text}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Click ☐ to mark a section understood
      </div>
    </div>
  );
}
