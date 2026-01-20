import { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function MetricCard({ title, value, change, changeLabel, icon, loading }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  if (loading) {
    return (
      <div className="metric-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
        <div className="mt-3 h-8 w-20 bg-muted rounded" />
        <div className="mt-2 h-3 w-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="metric-card group hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {icon && (
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>

      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            isPositive && "text-success",
            isNegative && "text-destructive",
            isNeutral && "text-muted-foreground"
          )}>
            {isPositive && <ArrowUpRight className="h-3 w-3" />}
            {isNegative && <ArrowDownRight className="h-3 w-3" />}
            {isNeutral && <Minus className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}








