"use client";

import dynamic from "next/dynamic";
import type { AnalyticsData } from "@/server/queries/analytics";

const AnalyticsCharts = dynamic(
  () => import("./analytics-charts").then((m) => ({ default: m.AnalyticsCharts })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted/20" /> }
);

export function AnalyticsChartsClient({ data }: { data: AnalyticsData }) {
  return <AnalyticsCharts data={data} />;
}
