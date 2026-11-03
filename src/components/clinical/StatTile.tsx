import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClinicalStatus = "normal" | "warning" | "high" | "critical" | "info";

export interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  status?: ClinicalStatus;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StatTile({
  label,
  value,
  unit,
  trend,
  status = "normal",
  subtext,
  icon,
  className,
  onClick,
}: StatTileProps) {
  // 12. Live values soft tint flash for 400 ms on status threshold change
  const [isFlashing, setIsFlashing] = useState(false);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current !== status && status !== "normal") {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 400);
      prevStatus.current = status;
      return () => clearTimeout(timer);
    }
    prevStatus.current = status;
  }, [status]);

  // Calm by default: abnormal states receive subtle border & soft background tint
  const statusStyles: Record<ClinicalStatus, string> = {
    normal: "border-border hover:border-slate-300 dark:hover:border-slate-700",
    info: "border-blue-500/30 bg-blue-500/[0.03] dark:bg-blue-500/[0.06]",
    warning: "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
    high: "border-orange-500/50 bg-orange-500/[0.05] dark:bg-orange-500/[0.10]",
    critical: "border-red-500/60 bg-red-500/[0.06] dark:bg-red-500/[0.12]",
  };

  const statusFlashStyles: Record<ClinicalStatus, string> = {
    normal: "",
    info: "ring-2 ring-blue-500/40 bg-blue-500/15",
    warning: "ring-2 ring-amber-500/40 bg-amber-500/15",
    high: "ring-2 ring-orange-500/40 bg-orange-500/15",
    critical: "ring-2 ring-red-500/50 bg-red-500/20",
  };

  const statusValueColors: Record<ClinicalStatus, string> = {
    normal: "text-foreground",
    info: "text-blue-700 dark:text-blue-400",
    warning: "text-amber-800 dark:text-amber-400",
    high: "text-orange-800 dark:text-orange-400",
    critical: "text-red-700 dark:text-red-400",
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative p-4 sm:p-5 rounded-xl transition-all duration-200 select-none",
        "bg-surface dark:bg-surface border shadow-sm",
        statusStyles[status],
        isFlashing && statusFlashStyles[status],
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {/* Header Row: Label & Optional Icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
        {icon && (
          <div className="text-muted-foreground shrink-0 opacity-80">
            {icon}
          </div>
        )}
      </div>

      {/* Main Numeral & Unit: Zero Layout Shift with Tabular Figures */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span
          className={cn(
            "text-2xl sm:text-3xl lg:text-4xl font-mono font-bold tracking-tight tabular-nums",
            statusValueColors[status]
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {/* Footer: Trend or Subtext */}
      {(trend || subtext) && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend.direction === "up" && "text-emerald-700 dark:text-emerald-400",
                trend.direction === "down" && "text-blue-700 dark:text-blue-400",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" && <ArrowUp className="w-3 h-3" />}
              {trend.direction === "down" && <ArrowDown className="w-3 h-3" />}
              {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-muted-foreground truncate text-[11px]">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
