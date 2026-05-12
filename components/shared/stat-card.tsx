import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type StatColor = "primary" | "success" | "warning" | "danger";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: StatColor;
  trend?: number;
}

const colorMap: Record<StatColor, { text: string; bg: string; border: string }> = {
  primary: { text: "text-[var(--token-cyan)]",    bg: "bg-[var(--token-cyan)]/10",    border: "border-[var(--token-cyan)]/20" },
  success: { text: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/10", border: "border-[var(--token-emerald)]/20" },
  warning: { text: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/20" },
  danger:  { text: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/10",     border: "border-[var(--token-red)]/20" },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: StatCardProps) {
  const { text, bg, border } = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="mt-0.5 flex items-center gap-2">
              {subtitle && (
                <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
              )}
              {trend !== undefined && (
                <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium", trendPositive ? "text-[var(--token-emerald)]" : "text-[var(--token-red)]")}>
                  {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", bg, border, text)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}
