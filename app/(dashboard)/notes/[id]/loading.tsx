import { Skeleton } from "@/components/ui/skeleton";

export default function NoteDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Title + tags */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>

      {/* Flags */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <div className="h-px bg-border/40" />

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
