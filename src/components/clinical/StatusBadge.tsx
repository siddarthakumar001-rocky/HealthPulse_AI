import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, AlertCircle, AlertOctagon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClinicalStatus } from "./StatTile";

export interface StatusBadgeProps {
  status: ClinicalStatus;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const configs: Record<
    ClinicalStatus,
    {
      defaultLabel: string;
      icon: React.ReactNode;
      classes: string;
    }
  > = {
    normal: {
      defaultLabel: "Normal",
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />,
      classes:
        "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:bg-emerald-500/20",
    },
    info: {
      defaultLabel: "Info",
      icon: <Info className="w-3 h-3 text-blue-700 dark:text-blue-400 shrink-0" />,
      classes:
        "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30 dark:bg-blue-500/20",
    },
    warning: {
      defaultLabel: "Warning",
      icon: <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />,
      classes:
        "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/35 dark:bg-amber-500/20",
    },
    high: {
      defaultLabel: "High Risk",
      icon: <AlertCircle className="w-3 h-3 text-orange-700 dark:text-orange-400 shrink-0" />,
      classes:
        "bg-orange-500/10 text-orange-900 dark:text-orange-300 border-orange-500/35 dark:bg-orange-500/20",
    },
    critical: {
      defaultLabel: "Critical",
      icon: <AlertOctagon className="w-3 h-3 text-red-700 dark:text-red-400 shrink-0" />,
      classes:
        "bg-red-500/10 text-red-900 dark:text-red-300 border-red-500/40 dark:bg-red-500/20 font-semibold",
    },
  };

  const config = configs[status] || configs.normal;
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-sans font-medium rounded-full border shadow-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.classes,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{displayLabel}</span>
    </Badge>
  );
}

