import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function CalendarLoading() {
  return (
    <div className="p-6">
      <DashboardSkeleton />
    </div>
  );
}
