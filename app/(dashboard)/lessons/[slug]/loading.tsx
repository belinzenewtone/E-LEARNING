import { LessonSkeleton } from "@/components/shared/loading-skeleton";

export default function LessonSlugLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <LessonSkeleton />
    </div>
  );
}
