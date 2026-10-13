/**
 * Frontend Health Service
 * Interfaces with IEEE 8-stage architecture endpoints
 */
// @ts-ignore
import api from '@/services/api';

export type ProvenanceType = 'SENSOR' | 'CSDI_RECONSTRUCTED' | 'FORECAST';
export type SignalQualityCategory = 'GOOD' | 'FAIR' | 'POOR' | 'UNAVAILABLE';

export interface VitalsPayload {
  heartRate: number | null;
  spo2: number | null;
  temperature: number | null;
  timestamp?: string;
}

export interface SignalQualityData {
  status: SignalQualityCategory;
  sqi: number;
  category: SignalQualityCategory;
  factors?: {
    signalContinuity: boolean;
    waveformStability: boolean;
    lowMotionArtifact: boolean;
    opticalSensorContact: boolean;
    physiologicalPlausibility: boolean;
  };
  message?: string;
  timestamp?: string;
}

export interface ActivityContextData {
  status?: string;
  activity: 'Resting' | 'Walking' | 'Running' | 'Sleeping' | 'Exercise' | 'Unavailable' | string;
  confidence: number | null;
  source: string;
  timestamp?: string;
}

export interface ContextSentinelResult {
  alertRequired: boolean;
  severity: 'NORMAL' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  vital: string;
  value: string | number;
  activity: string;
  persistence: string;
  signalQuality: string;
  provenance: ProvenanceType;
  baselineMl: string;
  decisionRule: string;
  reason: string;
  recommendedAction: string;
  timestamp?: string;
}

export interface HealthCurrentResponse {
  status: 'ACTIVE' | 'AWAITING_TELEMETRY';
  message?: string;
  vitals: VitalsPayload | null;
  provenance: ProvenanceType;
  signalQuality: SignalQualityData;
  activity: ActivityContextData;
  contextRisk: ContextSentinelResult;
}

export interface ReconstructionData {
  observationMask: {
    mask: { heartRate: number; spo2: number; temperature: number };
    observedChannels: number;
    totalChannels: number;
    missingnessRatio: number;
    rationale: Record<string, string>;
  };
  reconstruction: {
    status: string;
    csdiStatus: string;
    model: string;
    message: string;
    observedTelemetry: string;
    reconstructedTelemetry: string;
    disclaimer?: string;
  };
}

export const healthService = {
  // Current integrated state (Vitals + SQI + Activity + Sentinel)
  async getCurrent(): Promise<HealthCurrentResponse> {
    const res = await api.get('/health/current');
    return res.data;
  },

  // Signal Quality Assessment (Stage 2)
  async getSignalQuality(): Promise<SignalQualityData> {
    const res = await api.get('/health/signal-quality');
    return res.data;
  },

  // Activity Context Engine (Stage 5)
  async getActivityContext(): Promise<ActivityContextData> {
    const res = await api.get('/health/activity');
    return res.data;
  },

  // CSDI Reconstruction & Observation Mask (Stage 3 & 4)
  async getReconstructionState(): Promise<ReconstructionData> {
    const res = await api.get('/health/reconstruction');
    return res.data;
  },

  // Digital Twin state
  async getDigitalTwin(): Promise<any> {
    const res = await api.get('/digital-twin');
    return res.data;
  }
};
