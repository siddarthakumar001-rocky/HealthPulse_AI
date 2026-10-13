import React from 'react';
import { SignalQualityData } from '@/services/healthService';
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SignalQualityIndicatorProps {
  data?: SignalQualityData | null;
  compact?: boolean;
}

export const SignalQualityIndicator: React.FC<SignalQualityIndicatorProps> = ({
  data,
  compact = false
}) => {
  if (!data || data.status === 'UNAVAILABLE' || data.category === 'UNAVAILABLE') {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/30">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
        <div className="text-xs">
          <span className="font-semibold text-muted-foreground">SIGNAL QUALITY</span>
          <p className="text-[11px] text-muted-foreground">Signal quality unavailable — waiting for sensor data</p>
        </div>
      </div>
    );
  }

  const category = data.category || 'GOOD';
  const sqiScore = data.sqi != null ? Math.round(data.sqi * 100) : '--';

  const categoryStyles = {
    GOOD: {
      color: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    },
    FAIR: {
      color: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
      icon: <AlertCircle className="w-4 h-4 text-amber-500" />
    },
    POOR: {
      color: 'text-rose-500',
      badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
      icon: <XCircle className="w-4 h-4 text-rose-500" />
    }
  };

  const style = categoryStyles[category] || categoryStyles.GOOD;
  const factors = data.factors || {
    signalContinuity: true,
    waveformStability: true,
    lowMotionArtifact: true,
    opticalSensorContact: true,
    physiologicalPlausibility: true
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {style.icon}
          <span className="text-xs font-semibold">SQI: {category}</span>
        </div>
        <Badge variant="outline" className={`text-[10px] ${style.badge}`}>
          {sqiScore}%
        </Badge>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {style.icon}
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Signal Quality Assessment (Stage 2)
            </div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{category}</span>
              <span className="text-xs font-normal text-muted-foreground">(SQI {data.sqi?.toFixed(2) || '0.00'})</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold ${style.badge}`}>
          {sqiScore}% Fidelity
        </Badge>
      </div>

      {/* Engineering factors checklist with optical sensor terminology */}
      <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className={factors.signalContinuity ? 'text-emerald-500' : 'text-rose-500'}>
            {factors.signalContinuity ? '✓' : '✗'}
          </span>
          <span className="text-muted-foreground">Signal continuity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={factors.waveformStability ? 'text-emerald-500' : 'text-rose-500'}>
            {factors.waveformStability ? '✓' : '✗'}
          </span>
          <span className="text-muted-foreground">Waveform stability</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={factors.lowMotionArtifact ? 'text-emerald-500' : 'text-rose-500'}>
            {factors.lowMotionArtifact ? '✓' : '✗'}
          </span>
          <span className="text-muted-foreground">Low motion artifact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={factors.opticalSensorContact ? 'text-emerald-500' : 'text-rose-500'}>
            {factors.opticalSensorContact ? '✓' : '✗'}
          </span>
          <span className="text-muted-foreground">Optical sensor contact</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <span className={factors.physiologicalPlausibility ? 'text-emerald-500' : 'text-rose-500'}>
            {factors.physiologicalPlausibility ? '✓' : '✗'}
          </span>
          <span className="text-muted-foreground">Physiological plausibility</span>
        </div>
      </div>

      {data.message && (
        <p className="text-[10px] text-muted-foreground italic bg-muted/40 px-2 py-1 rounded">
          {data.message}
        </p>
      )}

      {category === 'POOR' && (
        <div className="flex items-start gap-1.5 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Sensor warning gated: Degraded signal suppresses clinical alert sirens to prevent false alarms.</span>
        </div>
      )}
    </div>
  );
};
