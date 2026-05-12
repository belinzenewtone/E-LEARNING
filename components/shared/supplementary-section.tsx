"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { cn } from "@/lib/utils";

interface SupplementaryItem {
  label: string;
  content: string;
}

export function SupplementarySection({ items }: { items: SupplementaryItem[] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Deepen Your Understanding
        </h3>
      </div>
      {items.map((item, i) => (
        <SupplementaryCard key={i} item={item} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function SupplementaryCard({
  item,
  defaultOpen,
}: {
  item: SupplementaryItem;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border-border/30 bg-card/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-medium">{item.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <CardContent className="px-4 pb-4 pt-0 max-h-[600px] overflow-y-auto">
          <div className="text-sm prose prose-sm prose-invert max-w-none [&_pre]:text-xs [&_pre]:max-h-[400px] [&_pre]:overflow-auto">
            <MarkdownContent content={item.content} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
