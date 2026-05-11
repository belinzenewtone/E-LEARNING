"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Loader2, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { globalSearch } from "@/server/actions/search";

interface SearchResult {
  id: string;
  title: string;
  href: string;
}

interface SearchResults {
  lessons: SearchResult[];
  assignments: SearchResult[];
  notes: SearchResult[];
}

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults>({
    lessons: [],
    assignments: [],
    notes: [],
  });
  const [isPending, startTransition] = React.useTransition();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search whenever query changes
  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ lessons: [], assignments: [], notes: [] });
      return;
    }

    startTransition(async () => {
      const data = await globalSearch(query);
      setResults(data);
    });
  }, [query]);

  // Reset state when dialog closes
  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setQuery("");
      setResults({ lessons: [], assignments: [], notes: [] });
    }
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults({ lessons: [], assignments: [], notes: [] });
    router.push(href);
  }

  const hasResults =
    results.lessons.length > 0 ||
    results.assignments.length > 0 ||
    results.notes.length > 0;

  const isSearching = query.trim().length >= 2;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground hidden sm:flex items-center"
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-xs font-normal hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </Button>

      {/* Mobile icon-only trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-muted-foreground hover:text-foreground sm:hidden"
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Global Search"
        description="Search lessons, assignments, and notes"
        className="[&_[cmdk-item]]:aria-selected:bg-primary/10 [&_[cmdk-item]]:aria-selected:text-primary"
      >
        <CommandInput
          placeholder="Search lessons, assignments, notes..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {/* Loading state */}
          {isPending && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state — only show when there's a query and not loading */}
          {!isPending && isSearching && !hasResults && (
            <CommandEmpty>No results for &ldquo;{query.trim()}&rdquo;</CommandEmpty>
          )}

          {/* Prompt before any query */}
          {!isPending && !isSearching && (
            <CommandEmpty className="text-muted-foreground">
              Type at least 2 characters to search&hellip;
            </CommandEmpty>
          )}

          {/* Results — only show when not loading */}
          {!isPending && hasResults && (
            <>
              {results.lessons.length > 0 && (
                <CommandGroup heading="Lessons">
                  {results.lessons.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`lesson-${item.id}-${item.title}`}
                      onSelect={() => navigate(item.href)}
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">Lesson</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.lessons.length > 0 && results.assignments.length > 0 && (
                <CommandSeparator />
              )}

              {results.assignments.length > 0 && (
                <CommandGroup heading="Assignments">
                  {results.assignments.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`assignment-${item.id}-${item.title}`}
                      onSelect={() => navigate(item.href)}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">Assignment</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.assignments.length > 0 && results.notes.length > 0 && (
                <CommandSeparator />
              )}

              {results.notes.length > 0 && (
                <CommandGroup heading="Notes">
                  {results.notes.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`note-${item.id}-${item.title}`}
                      onSelect={() => navigate(item.href)}
                    >
                      <PenLine className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">Note</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
