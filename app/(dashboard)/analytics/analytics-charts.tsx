"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock, Zap, BookOpen, Flame, Calendar, BarChart3, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { minutesToHours } from "@/lib/utils";
import type { AnalyticsData } from "@/server/queries/analytics";

const CYAN = "var(--token-cyan)";
const EMERALD = "var(--token-emerald)";
const AMBER = "var(--token-amber)";
const PURPLE = "var(--token-purple)";
const XP_TYPE_COLORS = [CYAN, EMERALD, AMBER, PURPLE, "var(--token-red)"];

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.17 0.015 240)",
    border: "1px solid oklch(1 0 0 / 8%)",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "var(--font-mono, monospace)",
  },
  labelStyle: { color: "oklch(0.95 0.005 240)" },
};

const axisProps = {
  tick: { fontSize: 10, fill: "oklch(0.60 0.01 240)", fontFamily: "var(--font-mono, monospace)" },
};

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </CardTitle>
  );
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { weeklyHours, xpOverTime, xpByType, lessonsOverTime, trackProgress, activityDays, moodTrend, summary } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
            SYSTEM // ANALYTICS DASHBOARD
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground/80">
            Telemetry across study velocity, XP throughput, and curriculum traversal.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Study Time" value={minutesToHours(summary.totalMinutes)} icon={Clock} color="primary" subtitle="All time" />
        <StatCard title="Total XP Earned" value={summary.totalXp.toLocaleString()} icon={Zap} color="warning" subtitle="All time" />
        <StatCard title="Lessons Completed" value={summary.lessonsCompleted} icon={BookOpen} color="success" subtitle="All time" />
        <StatCard title="Active Days" value={summary.activeDays} icon={Flame} color="danger" subtitle="Last 60 days" />
      </div>

      {/* Study hours & XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle icon={BarChart3}>STUDY HOURS // BY WEEK</SectionTitle>
          </CardHeader>
          <CardContent>
            {weeklyHours.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No study data yet"
                description="Log your first study session to see your weekly hours chart."
                action={{ label: "Log Study", href: "/study-log" }}
              />
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

        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle icon={Zap}>XP THROUGHPUT // OVER TIME</SectionTitle>
          </CardHeader>
          <CardContent>
            {xpOverTime.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No XP yet"
                description="Complete lessons and assignments to start earning XP and see your progress."
                action={{ label: "View Roadmap", href: "/roadmap" }}
              />
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
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle icon={BookOpen}>LESSONS COMPLETED // OVER TIME</SectionTitle>
          </CardHeader>
          <CardContent>
            {lessonsOverTime.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No completed lessons yet"
                description="Start your first lesson to see your completion trend over time."
                action={{ label: "Start Learning", href: "/lessons" }}
              />
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

        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle>TRACK PROGRESSION</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {trackProgress.map((track) => (
              <div key={track.slug} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold tracking-tight" style={{ color: track.color }}>{track.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    <span className="font-bold text-foreground">{track.completed}</span>
                    /{track.total} · {track.percent}%
                    {track.minutesSpent > 0 && ` · ${minutesToHours(track.minutesSpent)}`}
                  </span>
                </div>
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-700" style={{ width: `${track.percent}%`, backgroundColor: track.color }} />
                </div>
              </div>
            ))}
            {trackProgress.length === 0 && (
              <p className="text-xs text-muted-foreground/80">No track data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* XP breakdown + Review pointer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle icon={Zap}>XP DISTRIBUTION // BY TYPE</SectionTitle>
          </CardHeader>
          <CardContent>
            {xpByType.length === 0 ? (
              <EmptyState icon={Zap} title="No XP yet" description="Complete lessons and log study sessions to start earning XP." action={{ label: "Start Learning", href: "/lessons" }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={xpByType}
                    dataKey="points"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props) => `${(props as { name?: string }).name ?? ""} ${Math.round(((props.percent as number) ?? 0) * 100)}%`}
                    labelLine={false}
                  >
                    {xpByType.map((_, i) => (
                      <Cell key={i} fill={XP_TYPE_COLORS[i % XP_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val} XP`]} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl border-l-2 border-l-[var(--token-purple)]">
          <CardHeader>
            <SectionTitle icon={Brain}>SPACED REPETITION</SectionTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
            <p className="text-xs text-muted-foreground/80 text-center max-w-xs">
              Review checkpoint questions from completed lessons to reinforce long-term memory via the SM-2 algorithm.
            </p>
            <Button asChild className="font-mono text-xs font-semibold uppercase tracking-wider">
              <Link href="/review">LAUNCH REVIEW QUEUE</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mood & energy trend */}
      {moodTrend.length > 0 && (
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardHeader>
            <SectionTitle>STUDY MOOD // ENERGY TREND</SectionTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={moodTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip {...tooltipStyle} formatter={(val, name) => [val, name === "energy" ? "Energy (1-5)" : "Mood"]} />
                <Bar dataKey="energy" fill={AMBER} radius={[3, 3, 0, 0]} name="energy" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 text-center">
              ENERGY LEVEL (1–5) LOGGED WITH STUDY SESSIONS
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity Heatmap */}
      <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
        <CardHeader>
          <SectionTitle icon={Calendar}>ACTIVITY HEATMAP // LAST 60 DAYS</SectionTitle>
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
                    : day.minutes >= 60 ? "color-mix(in oklch, var(--token-cyan) 50%, transparent)"
                    : "color-mix(in oklch, var(--token-cyan) 25%, transparent)"
                    : "oklch(1 0 0 / 6%)",
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-white/5" /> NONE</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--token-cyan) 25%, transparent)" }} /> &lt;60M</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--token-cyan) 50%, transparent)" }} /> 60–120M</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--token-cyan)" }} /> 120M+</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
