import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { AlertOctagon, AlertCircle, AlertTriangle, Info, Clock, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type { ClinicalStatus } from "./StatTile";

export interface AlertCardProps {
  severity: ClinicalStatus;
  title: string;
  message: string;
  timestamp?: string;
  source?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function AlertCard({
  severity,
  title,
  message,
  timestamp,
  source,
  actionLabel,
  onAction,
  onDismiss,
  className,
}: AlertCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const borderAccents: Record<ClinicalStatus, string> = {
    normal: "border-emerald-500/30 bg-emerald-500/[0.02]",
    info: "border-blue-500/30 bg-blue-500/[0.02]",
    warning: "border-amber-500/40 bg-amber-500/[0.03]",
    high: "border-orange-500/50 bg-orange-500/[0.04]",
    critical: "border-red-500/60 bg-red-500/[0.05] ring-1 ring-red-500/20",
  };

  const severityIcons: Record<ClinicalStatus, React.ReactNode> = {
    normal: <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />,
    high: <AlertCircle className="w-4 h-4 text-orange-700 dark:text-orange-400 shrink-0 mt-0.5" />,
    critical: <AlertOctagon className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />,
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative"
    >
      <Card
        className={cn(
          "relative p-4 sm:p-5 rounded-xl border bg-surface dark:bg-surface shadow-sm transition-all duration-200",
          borderAccents[severity],
          severity === "critical" && !shouldReduceMotion && "ring-2 ring-red-500/40 animate-[pulse_1.5s_ease-out_1]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left Icon + Text Block */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {severityIcons[severity]}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={severity} size="sm" />
                <h4 className="text-sm font-semibold text-foreground tracking-tight truncate">
                  {title}
                </h4>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {message}
              </p>

              {/* Metadata Row: Source & Timestamp */}
              {(source || timestamp) && (
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                  {source && <span>{source}</span>}
                  {source && timestamp && <span>•</span>}
                  {timestamp && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timestamp}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Action CTA or Dismiss */}
          <div className="flex items-center gap-1 shrink-0">
            {actionLabel && onAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAction}
                className="h-8 px-2.5 text-xs font-mono font-medium gap-1"
              >
                {actionLabel}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
