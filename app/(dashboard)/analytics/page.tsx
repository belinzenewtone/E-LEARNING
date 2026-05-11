import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { getAnalyticsData } from "@/server/queries/analytics";
import { AnalyticsChartsClient } from "./analytics-charts-client";

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
        <AnalyticsChartsClient data={data} />
      </div>
    </div>
  );
}
