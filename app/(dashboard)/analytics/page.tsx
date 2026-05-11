import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Topbar } from "@/components/layout/topbar";
import { getAnalyticsData } from "@/server/queries/analytics";

const AnalyticsCharts = dynamic(
  () => import("./analytics-charts").then((m) => ({ default: m.AnalyticsCharts })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted/20" /> }
);

export const metadata = {
  title: "Analytics | Personal Learning OS",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Data fetched server-side — no client waterfall
  const data = await getAnalyticsData(session.user.id);

  return (
    <div>
      <Topbar title="Analytics" subtitle="Your learning insights and progress trends" />
      <div className="p-6">
        <AnalyticsCharts data={data} />
      </div>
    </div>
  );
}
