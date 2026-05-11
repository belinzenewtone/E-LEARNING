import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "primary" | "success" | "warning" | "danger";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: StatColor;
  trend?: number;
}

const colorMap: Record<StatColor, string> = {
  primary:  "text-[var(--token-cyan)]",
  success:  "text-[var(--token-emerald)]",
  warning:  "text-[var(--token-amber)]",
  danger:   "text-[var(--token-red)]",
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: StatCardProps) {
  const textColor = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="rounded-xl border border-white/[0.04] bg-[oklch(0.18_0.01_240)] p-4 transition-colors hover:border-white/[0.08]">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
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
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05]", textColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
