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
  primary: { text: "text-muted-foreground/80",    bg: "bg-muted/40",    border: "border-border/60" },
  success: { text: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/6", border: "border-[var(--token-emerald)]/15" },
  warning: { text: "text-[var(--token-amber)]",   bg: "bg-[var(--token-amber)]/6",   border: "border-[var(--token-amber)]/15" },
  danger:  { text: "text-[var(--token-red)]",     bg: "bg-[var(--token-red)]/6",     border: "border-[var(--token-red)]/15" },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: StatCardProps) {
  const { text, bg, border } = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm" data-slot="card">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </p>
          {(subtitle || trend !== undefined) && (
            <div className="mt-1 flex items-center gap-1.5">
              {subtitle && (
                <p className="truncate text-[10px] text-muted-foreground/70 font-medium">{subtitle}</p>
              )}
              {trend !== undefined && (
                <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-semibold", trendPositive ? "text-[var(--token-emerald)]" : "text-[var(--token-red)]")}>
                  {trendPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", bg, border, text)}>
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
