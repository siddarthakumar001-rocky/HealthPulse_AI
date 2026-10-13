import React from 'react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { SignalQualityIndicator } from './SignalQualityIndicator';
import { ActivityBadge } from './ActivityBadge';
import { ActivityContextData, SignalQualityData, ProvenanceType } from '@/services/healthService';
import { UserCheck, Shield, Activity, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HumanDigitalTwinStateProps {
  vitals: {
    heartRate: number | null;
    spo2: number | null;
    temperature: number | null;
  } | null;
  activity: ActivityContextData | null;
  signalQuality: SignalQualityData | null;
  provenance: ProvenanceType;
  twinData?: any;
}

export const HumanDigitalTwinState: React.FC<HumanDigitalTwinStateProps> = ({
  vitals,
  activity,
  signalQuality,
  provenance,
  twinData
}) => {
  const hasVitals = vitals && (vitals.heartRate != null || vitals.spo2 != null || vitals.temperature != null);

  return (
    <div className="p-4 rounded-xl border border-border/70 bg-card/70 backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span>Human Digital Twin Phenotype (Stage 7)</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Continuously updated patient-specific physiological & contextual digital state
            </p>
          </div>
        </div>
        <ProvenanceBadge provenance={provenance} />
      </div>

      {/* Phenotype Vital State Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg border border-border/40 bg-background/50">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Cardiac State
          </span>
          <div className="text-lg font-bold mt-0.5">
            {hasVitals && vitals?.heartRate ? `${vitals.heartRate} BPM` : 'Waiting...'}
          </div>
          <span className="text-[10px] text-muted-foreground">MAX30102 PPG</span>
        </div>

        <div className="p-3 rounded-lg border border-border/40 bg-background/50">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Peripheral O2
          </span>
          <div className="text-lg font-bold mt-0.5">
            {hasVitals && vitals?.spo2 ? `${vitals.spo2}%` : 'Waiting...'}
          </div>
          <span className="text-[10px] text-muted-foreground">Pulse Oximetry</span>
        </div>

        <div className="p-3 rounded-lg border border-border/40 bg-background/50">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Core Temperature
          </span>
          <div className="text-lg font-bold mt-0.5">
            {hasVitals && vitals?.temperature ? `${vitals.temperature}°C` : 'Waiting...'}
          </div>
          <span className="text-[10px] text-muted-foreground">DS18B20 Telemetry</span>
        </div>

        <div className="p-3 rounded-lg border border-border/40 bg-background/50">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Activity Context
          </span>
          <div className="text-sm font-bold mt-1">
            {activity?.activity || 'Resting'}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {activity?.confidence ? `${activity.confidence}% confidence` : 'IMU context'}
          </span>
        </div>
      </div>

      {/* Sub-panels: SQI and Activity Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SignalQualityIndicator data={signalQuality} />
        <ActivityBadge data={activity} />
      </div>

      {/* Provenance Distribution Section */}
      <div className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <PieChart className="w-3.5 h-3.5" />
            Telemetry Provenance Distribution
          </span>
          <Badge variant="outline" className="text-[10px]">
            {twinData?.dataQuality?.totalPoints ? `${twinData.dataQuality.totalPoints} frames ingested` : 'Active stream'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs">
          <div className="flex-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-2 rounded text-center border border-emerald-500/30">
            <div className="font-bold">
              {twinData?.dataQuality?.sensorMeasuredPoints != null 
                ? `${Math.round((twinData.dataQuality.sensorMeasuredPoints / (twinData.dataQuality.totalPoints || 1)) * 100)}%`
                : '100%'}
            </div>
            <div className="text-[10px]">Direct Sensor</div>
          </div>

          <div className="flex-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 p-2 rounded text-center border border-blue-500/30">
            <div className="font-bold">
              {twinData?.dataQuality?.csdiImputedPoints != null 
                ? `${Math.round((twinData.dataQuality.csdiImputedPoints / (twinData.dataQuality.totalPoints || 1)) * 100)}%`
                : '0%'}
            </div>
            <div className="text-[10px]">CSDI Imputed</div>
          </div>

          <div className="flex-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 p-2 rounded text-center border border-amber-500/30">
            <div className="font-bold">0%</div>
            <div className="text-[10px]">Forecast (Gated)</div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground pt-1">
          *The Human Digital Twin aggregates physical telemetry with contextual activity and signal quality.
          Telemetry provenance is exposed for complete clinical transparency.
        </p>
      </div>
    </div>
  );
};
