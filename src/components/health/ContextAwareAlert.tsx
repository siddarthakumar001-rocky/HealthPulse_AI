import React, { useState } from 'react';
import { ContextSentinelResult } from '@/services/healthService';
import { ProvenanceBadge } from './ProvenanceBadge';
import { ShieldAlert, Info, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContextAwareAlertProps {
  sentinel: ContextSentinelResult;
}

export const ContextAwareAlert: React.FC<ContextAwareAlertProps> = ({ sentinel }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sentinel) return null;

  const severityConfigs = {
    NORMAL: {
      border: 'border-border/60',
      bg: 'bg-card/40',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />
    },
    INFO: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: <Info className="w-4 h-4 text-blue-500" />
    },
    WARNING: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
    },
    HIGH: {
      border: 'border-orange-500/40',
      bg: 'bg-orange-500/5',
      badge: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
      icon: <ShieldAlert className="w-4 h-4 text-orange-500" />
    },
    CRITICAL: {
      border: 'border-rose-500/50',
      bg: 'bg-rose-500/10',
      badge: 'bg-rose-500/20 text-rose-600 border-rose-500/40 dark:text-rose-400',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
    }
  };

  const config = severityConfigs[sentinel.severity] || severityConfigs.NORMAL;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-3.5 backdrop-blur-sm transition-all space-y-2.5`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Context-Aware Safety Sentinel (Stage 6)
            </span>
            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${config.badge}`}>
              {sentinel.severity}
            </Badge>
          </div>
        </div>
        <ProvenanceBadge provenance={sentinel.provenance} />
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-semibold">{sentinel.reason}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Recommended Action: <strong className="text-foreground">{sentinel.recommendedAction}</strong>
          </div>
        </div>
      </div>

      {/* Explainability Toggle: "Why was this alert generated?" */}
      <div className="pt-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-7 text-xs font-medium px-2 text-muted-foreground hover:text-foreground flex items-center gap-1.5 -ml-2"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Why was this alert generated / evaluated?</span>
          {expanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>

        {expanded && (
          <div className="mt-2.5 p-3 rounded-lg bg-background/80 border border-border/50 text-xs space-y-2">
            <div className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              Mathematical Decision Breakdown: ALERT = f(Vitals, Activity, SQI, Persistence, Baseline ML, Provenance)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Evaluated Vital</span>
                <span className="font-bold">{sentinel.vital}: {sentinel.value}</span>
              </div>
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Activity Context</span>
                <span className="font-bold">{sentinel.activity}</span>
              </div>
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Signal Quality (SQI)</span>
                <span className="font-bold">{sentinel.signalQuality}</span>
              </div>
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Temporal Persistence</span>
                <span className="font-bold">{sentinel.persistence}</span>
              </div>
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Baseline Ensemble ML</span>
                <span className="font-bold">{sentinel.baselineMl} Risk</span>
              </div>
              <div className="p-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Decision Rule ID</span>
                <span className="font-mono font-bold text-[10px]">{sentinel.decisionRule}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground italic pt-1">
              *The safety sentinel preserves deterministic emergency escalation rules for predefined high-risk conditions,
              suppressing benign exercise-induced tachycardia and artifact-triggered false alarms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
