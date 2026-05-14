import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getModulesWithLessons } from "@/server/queries/lessons";
import { RoadmapClient } from "./roadmap-client";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { Topbar } from "@/components/layout/topbar";

async function RoadmapContent({ userId }: { userId: string }) {
  const [webTrack, dataTrack] = await Promise.all([
    getModulesWithLessons("web", userId),
    getModulesWithLessons("data-engineering", userId),
  ]);

  return <RoadmapClient webTrack={webTrack} dataTrack={dataTrack} />;
}

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Topbar title="Roadmap" subtitle="Your learning path across both tracks" />
      <Suspense fallback={<DashboardSkeleton />}>
        <RoadmapContent userId={session.user.id} />
      </Suspense>
    </>
  );
}
