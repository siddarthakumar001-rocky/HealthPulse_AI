import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DemoDataBadgeProps {
  label?: string;
  className?: string;
}

export function DemoDataBadge({
  label = "Simulated Data",
  className,
}: DemoDataBadgeProps) {
  return (
    <Badge
      variant="outline"
      title="This metric or visual is generated from simulated/demonstration streams for presentation and testing."
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md",
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 select-none",
        className
      )}
    >
      <Sparkles className="w-2.5 h-2.5 opacity-70 text-teal-600 dark:text-teal-400" />
      <span>{label}</span>
    </Badge>
  );
}

