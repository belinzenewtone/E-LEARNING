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
  primary:  { icon: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",   glow: "shadow-cyan-500/5",    text: "text-cyan-400"    },
  success:  { icon: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", glow: "shadow-emerald-500/5", text: "text-emerald-400" },
  warning:  { icon: "bg-amber-500/10 text-amber-400 border border-amber-500/20",  glow: "shadow-amber-500/5",   text: "text-amber-400"   },
  danger:   { icon: "bg-red-500/10 text-red-400 border border-red-500/20",        glow: "shadow-red-500/5",     text: "text-red-400"     },
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
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendPositive ? "text-emerald-400" : "text-red-400")}>
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
