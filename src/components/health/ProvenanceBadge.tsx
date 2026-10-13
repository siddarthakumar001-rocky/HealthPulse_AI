import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Radio, Cpu, Info } from 'lucide-react';

export type ProvenanceType = 'SENSOR' | 'CSDI_RECONSTRUCTED' | 'FORECAST';

interface ProvenanceBadgeProps {
  provenance: ProvenanceType | string;
  className?: string;
  showIcon?: boolean;
}

const PROVENANCE_CONFIG: Record<
  string,
  { label: string; tooltip: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  SENSOR: {
    label: 'SENSOR',
    tooltip: 'Directly measured from wearable hardware.',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    icon: <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
  },
  CSDI_RECONSTRUCTED: {
    label: 'CSDI RECONSTRUCTED',
    tooltip: 'Estimated from observed physiological telemetry using diffusion-based reconstruction.',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
    icon: <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-400" />
  },
  FORECAST: {
    label: 'FORECAST',
    tooltip: 'Predicted future physiological state; not a direct measurement.',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    icon: <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
  }
};

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  className = '',
  showIcon = true
}) => {
  const normalizedKey = (provenance || 'SENSOR').toUpperCase().replace('-', '_');
  const config = PROVENANCE_CONFIG[normalizedKey] || PROVENANCE_CONFIG.SENSOR;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border cursor-help transition-colors select-none ${config.bg} ${config.text} ${config.border} ${className}`}
          >
            {showIcon && config.icon}
            <span>[{config.label}]</span>
            <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs p-2">
          <p className="font-semibold mb-0.5">Telemetry Provenance: {config.label}</p>
          <p className="text-muted-foreground">{config.tooltip}</p>
          <p className="text-[10px] text-amber-500 mt-1">
            *Non-ground-truth telemetry is gated and non-diagnostic.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
