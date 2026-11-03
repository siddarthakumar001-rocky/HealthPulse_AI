import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChartRangeOption {
  label: string;
  value: string;
}

export interface ChartFrameProps {
  title: string;
  subtitle?: string;
  accessibleDescription?: string;
  rangeOptions?: ChartRangeOption[];
  activeRange?: string;
  onRangeChange?: (range: string) => void;
  legendItems?: { label: string; color: string; style?: "solid" | "dashed" }[];
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function ChartFrame({
  title,
  subtitle,
  accessibleDescription,
  rangeOptions,
  activeRange,
  onRangeChange,
  legendItems,
  children,
  className,
  headerAction,
}: ChartFrameProps) {
  return (
    <Card
      className={cn(
        "p-4 sm:p-6 rounded-xl border border-border bg-surface dark:bg-surface shadow-sm space-y-4",
        className
      )}
      role="region"
      aria-label={title}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
          {accessibleDescription && (
            <span className="sr-only">{accessibleDescription}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          {rangeOptions && rangeOptions.length > 0 && (
            <div className="flex items-center p-0.5 rounded-lg border border-border bg-slate-100 dark:bg-slate-900 text-xs">
              {rangeOptions.map(opt => {
                const isActive = activeRange === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onRangeChange?.(opt.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium text-xs transition-all",
                      isActive
                        ? "bg-surface dark:bg-slate-800 text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {headerAction}
        </div>
      </div>

      {/* Legend Row */}
      {legendItems && legendItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-0.5">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-3 h-1 rounded-full shrink-0"
                style={{
                  backgroundColor: item.color,
                  borderTop: item.style === "dashed" ? "1px dashed #fff" : undefined,
                }}
              />
              <span className="text-[11px] font-sans">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary Chart Area */}
      <div className="w-full relative min-h-[260px] sm:min-h-[300px]">
        {children}
      </div>
    </Card>
  );
}

