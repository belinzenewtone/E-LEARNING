import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary",
        secondary:
          "border-transparent bg-secondary/10 text-secondary",
        destructive:
          "border-transparent bg-destructive/10 text-destructive",
        outline: "border-border text-foreground",
        success:
          "border-[var(--token-emerald)]/20 bg-[var(--token-emerald)]/10 text-[var(--token-emerald)]",
        warning:
          "border-[var(--token-amber)]/20 bg-[var(--token-amber)]/10 text-[var(--token-amber)]",
        info:
          "border-[var(--token-cyan)]/20 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]",
        muted:
          "border-border bg-muted text-muted-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
