"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LessonError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[lesson] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Failed to load lesson</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/lessons">
            <ArrowLeft className="h-3.5 w-3.5" />
            All Lessons
          </Link>
        </Button>
        <Button onClick={reset} size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
