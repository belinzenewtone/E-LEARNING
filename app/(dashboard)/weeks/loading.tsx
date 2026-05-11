import { Skeleton } from "@/components/ui/skeleton";

export default function WeeksLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      {/* Phase pills */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-36 rounded-full" />
        ))}
      </div>
      {/* Two phase groups */}
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="rounded-xl border border-border/40 bg-card/60 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-40" />
                <div className="space-y-1.5">
                  {Array.from({ length: 3 }).map((_, k) => (
                    <Skeleton key={k} className="h-3 w-full" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
