import React from 'react';
import { ReconstructionData } from '@/services/healthService';
import { ProvenanceBadge } from './ProvenanceBadge';
import { Cpu, AlertTriangle, Layers, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReconstructionPanelProps {
  data?: ReconstructionData | null;
}

export const ReconstructionPanel: React.FC<ReconstructionPanelProps> = ({ data }) => {
  const isPending = !data || data.reconstruction?.csdiStatus === 'MODEL_INTEGRATION_PENDING';
  const mask = data?.observationMask?.mask || { heartRate: 1, spo2: 1, temperature: 1 };
  const missingnessRatio = data?.observationMask?.missingnessRatio != null 
    ? Math.round(data.observationMask.missingnessRatio * 100) 
    : 0;

  return (
    <div className="p-4 rounded-xl border border-border/70 bg-card/70 backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span>CSDI Physiological Reconstruction (Stage 4)</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Conditional Score-Based Diffusion for Multichannel Wearable Imputation
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={
            isPending
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
              : 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400'
          }
        >
          {isPending ? 'MODEL INTEGRATION PENDING' : 'ACTIVE DIFFUSION'}
        </Badge>
      </div>

      {/* Observation Masking Breakdown (Stage 3) */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="w-3.5 h-3.5" />
            Stage 3: Observation Mask (M_c ∈ {'{0, 1}'})
          </span>
          <span className="text-muted-foreground">
            Missingness Ratio: <strong className="text-foreground">{missingnessRatio}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded border border-border/40 bg-background/50 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground">Heart Rate PPG</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold">M_HR = {mask.heartRate}</span>
              <span className={`text-[10px] font-semibold ${mask.heartRate === 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {mask.heartRate === 1 ? 'Observed' : 'Missing'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded border border-border/40 bg-background/50 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground">SpO2 Optical</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold">M_SpO2 = {mask.spo2}</span>
              <span className={`text-[10px] font-semibold ${mask.spo2 === 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {mask.spo2 === 1 ? 'Observed' : 'Missing'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded border border-border/40 bg-background/50 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground">DS18B20 Temp</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold">M_Temp = {mask.temperature}</span>
              <span className={`text-[10px] font-semibold ${mask.temperature === 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {mask.temperature === 1 ? 'Observed' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Status & Scientific Context */}
      {isPending ? (
        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">CSDI Status: MODEL INTEGRATION PENDING</p>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p>• Observed telemetry: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Available</span></p>
                <p>• Reconstructed telemetry: <span className="text-amber-600 dark:text-amber-400 font-semibold">Unavailable</span></p>
                <p className="pt-1">
                  In accordance with strict scientific validation protocols, missing segments are not simulated with synthetic numbers.
                  Live telemetry continues via hardware sensors.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-semibold">CSDI Diffusion Inference Active</p>
          <p className="text-[11px] mt-1 text-muted-foreground">
            Imputed segments tagged with <ProvenanceBadge provenance="CSDI_RECONSTRUCTED" className="mx-1" /> and gated by the context sentinel.
          </p>
        </div>
      )}

      {/* Provenance & Literature Acknowledgment */}
      <div className="pt-1 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
        <p>
          CSDI (Conditional Score-Based Diffusion) is based on established methodology (Tashiro et al., NeurIPS 2021).
          HealthPulse AI integrates CSDI into wearable observation masking and provenance-gated safety.
        </p>
      </div>
    </div>
  );
};
