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

const colorMap: Record<StatColor, { icon: string; glow: string; text: string }> = {
  primary:  { icon: "bg-[var(--token-cyan)]/10 text-[var(--token-cyan)] border border-[var(--token-cyan)]/20",   glow: "shadow-[var(--token-cyan)]/5",    text: "text-[var(--token-cyan)]"    },
  success:  { icon: "bg-[var(--token-emerald)]/10 text-[var(--token-emerald)] border border-[var(--token-emerald)]/20", glow: "shadow-[var(--token-emerald)]/5", text: "text-[var(--token-emerald)]" },
  warning:  { icon: "bg-[var(--token-amber)]/10 text-[var(--token-amber)] border border-[var(--token-amber)]/20",  glow: "shadow-[var(--token-amber)]/5",   text: "text-[var(--token-amber)]"   },
  danger:   { icon: "bg-[var(--token-red)]/10 text-[var(--token-red)] border border-[var(--token-red)]/20",        glow: "shadow-[var(--token-red)]/5",     text: "text-[var(--token-red)]"     },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: StatCardProps) {
  const colors = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className={cn(
      "group relative rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-border/80 hover:bg-card/80 hover:shadow-lg",
      colors.glow
    )}>
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-105", colors.icon)}>
          <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground leading-none">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="mt-1.5 flex items-center gap-2">
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend !== undefined && (
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendPositive ? "text-[var(--token-emerald)]" : "text-[var(--token-red)]")}>
                  {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
