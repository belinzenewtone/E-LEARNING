import { AssignmentSkeleton } from "@/components/shared/loading-skeleton";

export default function AssignmentDetailLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AssignmentSkeleton />
    </div>
  );
}
