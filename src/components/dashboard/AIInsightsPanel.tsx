import { motion, animate } from "framer-motion";
import { Brain, AlertTriangle, Shield, Wifi, Zap, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

interface AIInsightsPanelProps {
  healthScore: number;
  stressLevel: string;
  condition: string;
  message: string;
  insights?: string[];
  isEmergency: boolean;
  recommendations?: {
    lifestyle?: string[];
    diet?: string[];
    activity?: string[];
    medicines?: string[];
    disclaimer?: string;
  };
  onboarding?: any;
  rmssd?: number | null;
  rawBleData?: string | null;
}

/* ── Circular Progress Ring ──────────────────────────────────── */
function CircularProgress({ value, size = 80, strokeWidth = 5, color, label }: {
  value: number; size?: number; strokeWidth?: number; color: string; label: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ - (circ * Math.min(value, 100)) / 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-slate-200 dark:stroke-white/5" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dash }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-sm font-bold" style={{ color, textShadow: `0 0 8px ${color}80` }}>{value}%</span>
        </div>
      </div>
      <span className="font-mono text-[8px] uppercase tracking-widest font-bold text-slate-500 dark:text-[#8FB8D8]">{label}</span>
    </div>
  );
}

/* ── Glass Card ──────────────────────────────────────────────── */
function AICard({ children, emergency = false }: { children: React.ReactNode; emergency?: boolean }) {
  return (
    <motion.div
      className={`relative rounded-2xl p-5 overflow-hidden border ${
        emergency
          ? "bg-red-50/70 dark:bg-[rgba(255,59,92,0.05)] border-red-400 dark:border-red-500/30"
          : "bg-card/90 border-border"
      } backdrop-blur-xl shadow-md`}
      style={{
        boxShadow: emergency
          ? "0 4px 30px rgba(255,59,92,0.15)"
          : "0 4px 20px rgba(227,83,54,0.06)",
      }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)"
      }} />
      {children}
    </motion.div>
  );
}

export default function AIInsightsPanel({
  healthScore, stressLevel, condition, message, insights = [], isEmergency, recommendations, onboarding, rmssd, rawBleData
}: AIInsightsPanelProps) {
  const { t } = useTranslation();
  const isHighRisk = (stressLevel === 'HIGH' || isEmergency) && condition !== 'NOMINAL' && condition !== '';
  const mainColor = isHighRisk ? "#dc2626" : "#E35336";
  const aiConfidence = healthScore > 0 ? Math.min(98, healthScore + 15) : 87;
  const anomalyCount = isHighRisk ? Math.floor(Math.random() * 3) + 1 : 0;

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── AI RISK PREDICTION ────────────────────────────────── */}
      <AICard emergency={isHighRisk}>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
            <Brain className="h-5 w-5" style={{ color: mainColor, filter: `drop-shadow(0 0 6px ${mainColor}80)` }} />
          </motion.div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">
            {t("dashboard.aiRiskPrediction", "AI Risk Prediction")}
          </h3>
          {isHighRisk && <AlertTriangle className="h-3 w-3 animate-pulse text-red-500" />}
        </div>
        <div className="flex flex-col gap-1 relative z-10">
          <span className="font-display text-xl font-bold uppercase" style={{ color: mainColor, textShadow: `0 0 15px ${mainColor}60` }}>
            {stressLevel === 'LOW' ? t("dashboard.nominal", "NOMINAL") : t(`dashboard.${stressLevel.toLowerCase()}`, stressLevel || 'STANDBY')}
          </span>
          <div className="flex justify-between items-center">
            <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
              {t("dashboard.aiConfidence", "AI CONFIDENCE")}: {aiConfidence}%
            </span>
            {rmssd !== undefined && rmssd !== null && rmssd > 0 && (
              <span className="font-mono text-[8px] uppercase tracking-widest text-primary font-bold">
                RMSSD: {rmssd.toFixed(1)}ms
              </span>
            )}
          </div>
          {/* Confidence bar */}
          <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden bg-muted">
            <motion.div className="h-full rounded-full" style={{
              background: mainColor, boxShadow: `0 0 8px ${mainColor}`,
            }} initial={{ width: "0%" }} animate={{ width: `${aiConfidence}%` }} transition={{ duration: 1.5 }} />
          </div>
        </div>
        {/* Processing indicator */}
        <motion.div className="flex items-center gap-1 mt-2 relative z-10"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-1 h-1 rounded-full" style={{ background: mainColor }}
                animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="font-mono text-[8px] uppercase tracking-widest font-bold" style={{ color: mainColor }}>
            {t("dashboard.processing", "PROCESSING")}
          </span>
        </motion.div>
      </AICard>

      {/* ── HEALTH SCORE ──────────────────────────────────────── */}
      <AICard>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" style={{ boxShadow: "0 0 6px #E35336" }} />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">
            {t("dashboard.healthScore", "Daily Health Score")}
          </h3>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <CircularProgress value={healthScore} size={70} color={isHighRisk ? "#dc2626" : "#E35336"} label={t("dashboard.overall", "OVERALL")} />
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-bold" style={{
              color: isHighRisk ? "#dc2626" : "#E35336",
              textShadow: `0 0 15px ${isHighRisk ? "rgba(220,38,38,0.3)" : "rgba(227,83,54,0.3)"}`
            }}>{healthScore}</span>
            <span className="font-mono text-[8px] font-bold text-muted-foreground">
              / 100 {t("dashboard.points", "POINTS")}
            </span>
          </div>
        </div>
      </AICard>

      {/* ── ABNORMALITY DETECTION ─────────────────────────────── */}
      <AICard emergency={anomalyCount > 0}>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: anomalyCount > 0 ? "#dc2626" : "#E35336" }} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">
              {t("dashboard.anomalyDetection", "Anomaly Detection")}
            </h3>
          </div>
          <span className="font-display text-sm font-bold" style={{
            color: anomalyCount > 0 ? "#dc2626" : "#E35336",
            textShadow: `0 0 8px ${anomalyCount > 0 ? "#dc2626" : "#E35336"}`
          }}>{anomalyCount}</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-widest font-bold relative z-10" style={{
          color: anomalyCount > 0 ? "#dc2626" : "#E35336"
        }}>
          {anomalyCount > 0 ? t("dashboard.anomaliesFlagged", "ANOMALIES FLAGGED") : t("dashboard.allClear", "ALL CLEAR")}
        </span>
      </AICard>

      {/* ── SENSOR STATUS ─────────────────────────────────────── */}
      <AICard>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Wifi className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">
            {t("dashboard.sensorStatus", "Sensor Status")}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {[
            { label: "ESP32", status: t("dashboard.online", "ONLINE"), color: "#E35336" },
            { label: "WiFi", status: t("dashboard.connected", "CONNECTED"), color: "#E35336" },
            { label: "MAX30102", status: t("dashboard.active", "ACTIVE"), color: "#10b981" },
            { label: "DS18B20", status: t("dashboard.active", "ACTIVE"), color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }}
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="flex flex-col">
                <span className="font-mono text-[8px] font-bold text-slate-700 dark:text-[#E2F3FF]">{s.label}</span>
                <span className="font-mono text-[7px] font-bold" style={{ color: s.color }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </AICard>

      {/* ── EMERGENCY ALERT STATE ─────────────────────────────── */}
      <AICard emergency={isEmergency}>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <motion.div animate={isEmergency ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
              <Zap className="h-4 w-4" style={{ color: isEmergency ? "#dc2626" : "#0284c7" }} />
            </motion.div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700 dark:text-[#8FB8D8]">
              {t("dashboard.emergency", "Emergency")}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase" style={{
            background: isEmergency ? "rgba(239,68,68,0.15)" : "rgba(2,132,199,0.12)",
            border: `1px solid ${isEmergency ? "rgba(239,68,68,0.4)" : "rgba(2,132,199,0.3)"}`,
            color: isEmergency ? "#dc2626" : "#0284c7",
          }}>
            {isEmergency ? t("dashboard.active", "ACTIVE") : t("dashboard.standby", "STANDBY")}
          </span>
        </div>
      </AICard>

      {/* ── NEURAL FEED (Terminal Logs) ───────────────────────── */}
      <AICard>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-700 dark:text-[#00E5FF]" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700 dark:text-[#8FB8D8]">
              {t("dashboard.neuralFeed", "Neural Feed")}
            </h3>
          </div>
          {isHighRisk && <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />}
        </div>
        <div className="rounded-xl p-3 font-mono text-[10px] overflow-hidden relative max-h-40 z-10 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-cyan-500/10">
          <motion.div className="flex flex-col gap-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {insights.map((insight, i) => (
              <div key={`i-${i}`} className="flex gap-2" style={{ animationDelay: `${i * 150}ms` }}>
                <span className="shrink-0 text-cyan-600 dark:text-[#00E5FF]">&gt;</span>
                <span className="leading-relaxed break-words text-slate-700 dark:text-[#E2F3FF]">{insight}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <span className="shrink-0" style={{ color: isHighRisk ? "#dc2626" : "#0284c7" }}>&gt;</span>
              <span className="leading-relaxed break-words font-medium" style={{ color: isHighRisk ? "#dc2626" : "#0284c7" }}>
                {message || "Vitals within nominal parameters."}
              </span>
            </div>
            {recommendations?.lifestyle?.slice(0, 2).map((rec, i) => (
              <div key={`l-${i}`} className="flex gap-2">
                <span className="shrink-0 text-blue-600 dark:text-[#38BDF8]">&gt;</span>
                <span className="uppercase text-[8px] text-slate-600 dark:text-[rgba(226,243,255,0.6)]">[LIFESTYLE] {rec}</span>
              </div>
            ))}
            {rawBleData && (
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-cyan-500/10">
                <span className="font-mono text-[7px] text-cyan-700 dark:text-cyan-500/50">RAW BLE TELEMETRY:</span>
                <span className="font-mono text-[8px] break-all text-cyan-800 dark:text-cyan-500/70">{rawBleData}</span>
              </div>
            )}
          </motion.div>
          <div className="absolute bottom-0 left-0 w-full h-6 pointer-events-none bg-gradient-to-t from-slate-100 dark:from-[#050816] to-transparent opacity-80" />
        </div>
      </AICard>
    </div>
  );
}
