import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Brain } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { getReviewQueue } from "@/server/queries/review";
import { ReviewClient } from "./review-client";

export const metadata = {
  title: "Review Queue | Personal Learning OS",
};

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let queue: Awaited<ReturnType<typeof getReviewQueue>> = [];
  try {
    queue = await getReviewQueue(session.user.id);
  } catch {
    /* LessonCheckpointAnswer table may not exist in older deploys */
  }

  return (
    <div>
      <Topbar
        breadcrumbs={[{ label: "Review" }]}
        title="Spaced Repetition Queue"
        subtitle={
          queue.length > 0
            ? `${queue.length} checkpoint question${queue.length !== 1 ? "s" : ""} due for review`
            : "All caught up — nothing due right now"
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {queue.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--token-amber)]/20 bg-[var(--token-amber)]/5 px-4 py-3">
            <Brain className="h-5 w-5 text-[var(--token-amber)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {queue.length} question{queue.length !== 1 ? "s" : ""} due
              </p>
              <p className="text-xs text-muted-foreground">
                Reviewing on schedule strengthens long-term memory via the SM-2 algorithm.
              </p>
            </div>
          </div>
        )}
        <ReviewClient queue={queue} />
      </div>
    </div>
  );
}
