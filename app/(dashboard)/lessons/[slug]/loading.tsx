import { Skeleton } from "@/components/ui/skeleton";

// ── Left info panel skeleton (280px) ─────────────────────────────────────────

function InfoPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {/* Badges */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        <div className="h-px w-full bg-border/30" />

        {/* Objective */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="h-px w-full bg-border/30" />

        {/* Source */}
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>

        {/* Time */}
        <Skeleton className="h-3.5 w-28" />

        <div className="h-px w-full bg-border/30" />

        {/* Key concepts */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main study area skeleton (1fr) ───────────────────────────────────────────

function StudyAreaSkeleton() {
  return (
    <div className="space-y-5">
      {/* Source review toggle */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Personal notes */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-[120px] w-full rounded-md" />
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Checkpoint questions */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[80px] w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-[72px] w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Separator + complete button */}
      <div className="h-px w-full bg-border/30" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

// ── Right progress sidebar skeleton (220px) ───────────────────────────────────

function ProgressSidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Week progress */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex items-center gap-3">
          {/* Progress ring placeholder */}
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Assignment link */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>

      {/* Next lesson */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

// ── Page loading export ───────────────────────────────────────────────────────

export default function LessonSlugLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3.5 w-36" />
      </nav>

      {/* Three-column grid: 280px | 1fr | 220px */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr_220px]">
        <aside>
          <InfoPanelSkeleton />
        </aside>

        <main>
          <StudyAreaSkeleton />
        </main>

        <aside>
          <ProgressSidebarSkeleton />
        </aside>
      </div>
    </div>
  );
}
