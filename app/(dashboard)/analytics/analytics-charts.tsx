"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Clock, Zap, BookOpen, Flame, Calendar } from "lucide-react";
import { minutesToHours } from "@/lib/utils";
import type { AnalyticsData } from "@/server/queries/analytics";

const CYAN = "#22d3ee";
const EMERALD = "#34d399";

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.17 0.015 240)",
    border: "1px solid oklch(1 0 0 / 8%)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "oklch(0.95 0.005 240)" },
};

const axisProps = {
  tick: { fontSize: 11, fill: "oklch(0.60 0.01 240)" },
};

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { weeklyHours, xpOverTime, lessonsOverTime, trackProgress, activityDays, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Study Time" value={minutesToHours(summary.totalMinutes)} icon={Clock} color="primary" subtitle="All time" />
        <StatCard title="Total XP Earned" value={summary.totalXp.toLocaleString()} icon={Zap} color="warning" subtitle="All time" />
        <StatCard title="Lessons Completed" value={summary.lessonsCompleted} icon={BookOpen} color="success" subtitle="All time" />
        <StatCard title="Active Days" value={summary.activeDays} icon={Flame} color="danger" subtitle="Last 60 days" />
      </div>

      {/* Study hours & XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study Hours by Week</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyHours.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No study data yet. Log your first session!</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyHours} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="week" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val}h`, "Hours"]} />
                  <Bar dataKey="hours" fill={CYAN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">XP Earned Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {xpOverTime.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Complete lessons and assignments to earn XP!</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={xpOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val} XP`, "Cumulative XP"]} />
                  <Area type="monotone" dataKey="xp" stroke={CYAN} fill="url(#xpGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lessons over time & Track Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lessons Completed Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {lessonsOverTime.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed lessons yet. Start your first lesson!</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lessonsOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [val, "Total Lessons"]} />
                  <Line type="monotone" dataKey="count" stroke={EMERALD} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Track Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {trackProgress.map((track) => (
              <div key={track.slug} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium" style={{ color: track.color }}>{track.name}</span>
                  <span className="text-muted-foreground text-xs">{track.completed}/{track.total} · {track.percent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${track.percent}%`, backgroundColor: track.color }}
                  />
                </div>
              </div>
            ))}
            {trackProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">No track data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Activity Heatmap — Last 60 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {activityDays.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.minutes}min`}
                className="w-3.5 h-3.5 rounded-sm transition-colors cursor-default"
                style={{
                  backgroundColor: day.active
                    ? day.minutes >= 120 ? CYAN
                    : day.minutes >= 60 ? "#22d3ee80"
                    : "#22d3ee40"
                    : "oklch(1 0 0 / 6%)",
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-white/5" /> No activity</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22d3ee40" }} /> &lt;60 min</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22d3ee80" }} /> 60–120 min</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CYAN }} /> 120+ min</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
