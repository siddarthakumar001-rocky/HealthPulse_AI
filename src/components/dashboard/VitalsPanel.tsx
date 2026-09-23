import { useTranslation } from "react-i18next";
import { Heart, Thermometer, Wind, Activity, Gauge } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface VitalsPanelProps {
  heartRate: number;
  spo2: number;
  temperature: number;
  onboarding?: any;
}

/* ── Animated number count-up ────────────────────────────────── */
function AnimatedNumber({ value, decimals = 0, className, style }: { value: number; decimals?: number; className?: string; style?: React.CSSProperties }) {
  const motionVal = useMotionValue(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.2, ease: "easeOut" });
    const unsub = motionVal.on("change", (v) => { if (nodeRef.current) nodeRef.current.textContent = v.toFixed(decimals); });
    return () => { controls.stop(); unsub(); };
  }, [value, decimals]);
  return <span ref={nodeRef} className={className} style={style}>{value.toFixed(decimals)}</span>;
}

/* ── Mini ECG Waveform ───────────────────────────────────────── */
function MiniECG({ color, active, speed = 1 }: { color: string; active: boolean; speed?: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-25 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="w-full h-full">
        {active ? (
          <motion.path
            d="M 0 20 L 30 20 L 36 20 L 40 8 L 44 32 L 48 14 L 52 26 L 56 20 L 80 20 L 130 20 L 136 20 L 140 8 L 144 32 L 148 14 L 152 26 L 156 20 L 200 20"
            fill="none" stroke={color} strokeWidth="1.5"
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <path d="M 0 20 L 200 20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        )}
      </svg>
    </div>
  );
}

/* ── Glass Card Wrapper ──────────────────────────────────────── */
function GlassVitalCard({ children, borderColor, glowColor, scanColor }: { children: React.ReactNode; borderColor: string; glowColor: string; scanColor?: string }) {
  return (
    <motion.div
      className="relative rounded-2xl p-5 overflow-hidden cursor-default bg-card/90 border border-border backdrop-blur-xl shadow-md"
      style={{
        boxShadow: `0 4px 20px ${glowColor}`,
      }}
      whileHover={{ scale: 1.04, y: -3, boxShadow: `0 0 35px ${glowColor}` }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Holographic sheen */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(227,83,54,0.03) 100%)"
      }} />

      {/* Animated Scanning Line */}
      {scanColor && (
        <motion.div
          className="absolute left-0 w-full pointer-events-none"
          style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${scanColor}, transparent)`,
            boxShadow: `0 0 10px ${scanColor}, 0 0 20px ${scanColor}`,
            opacity: 0.6,
            zIndex: 0
          }}
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {children}
    </motion.div>
  );
}

export default function VitalsPanel({ heartRate, spo2, temperature, onboarding }: VitalsPanelProps) {
  const { t } = useTranslation();
  const hrColor = heartRate > 100 || (heartRate > 0 && heartRate < 50) ? "#FF3B5C" : "#E35336";
  const spo2Color = spo2 > 0 && spo2 < 95 ? "#FF9900" : "#E35336";
  const isHighTemp = temperature > 37.5;
  const tempColor = isHighTemp ? "#FF3B5C" : "#E35336";

  const CIRCUMFERENCE = 2 * Math.PI * 40;
  const spo2Dash = CIRCUMFERENCE - (CIRCUMFERENCE * Math.min(spo2 || 0, 100)) / 100;
  const tempPct = temperature > 0 ? Math.min(100, Math.max(0, ((temperature - 34) / 8) * 100)) : 0;

  // Blood pressure estimation
  const systolic = heartRate > 0 ? Math.round(110 + (heartRate - 72) * 0.3) : 0;
  const diastolic = heartRate > 0 ? Math.round(70 + (heartRate - 72) * 0.15) : 0;

  // Stress level from onboarding
  const stressLevel = onboarding?.stress_level || "low";

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── HEART RATE ─────────────────────────────────────────── */}
      <GlassVitalCard borderColor={`${hrColor}40`} glowColor={`${hrColor}20`} scanColor="#E35336">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: hrColor, boxShadow: `0 0 6px ${hrColor}` }} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                {t("dashboard.heartRate", "Heart Rate")}
              </h3>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedNumber value={heartRate || 0} className="font-display text-3xl md:text-4xl font-bold" style={{ color: hrColor, textShadow: `0 0 15px ${hrColor}60` } as any} />
              <span className="font-mono text-[10px] pb-1 font-bold text-muted-foreground">{t("dashboard.bpm", "BPM")}</span>
            </div>
          </div>
          <motion.div
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: `${hrColor}15`, border: `1px solid ${hrColor}40` }}
            animate={heartRate > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 60 / Math.max(heartRate, 60), repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-4 w-4" style={{ color: hrColor }} />
          </motion.div>
        </div>
        <MiniECG color={hrColor} active={heartRate > 0} speed={Math.max(0.4, 60 / Math.max(heartRate, 1))} />
      </GlassVitalCard>

      {/* ── SpO2 ───────────────────────────────────────────────── */}
      <GlassVitalCard borderColor={`${spo2Color}40`} glowColor={`${spo2Color}20`} scanColor="#E35336">
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: spo2Color, boxShadow: `0 0 6px ${spo2Color}` }} />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">{t("dashboard.spo2", "Oxygen Level")}</h3>
        </div>
        <div className="flex items-center justify-center relative z-10 py-2">
          <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-24 md:h-24" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none" stroke={spo2Color} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: spo2Dash }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 8px ${spo2Color}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatedNumber value={spo2 || 0} className="font-display text-2xl md:text-3xl font-bold" style={{ color: spo2Color, textShadow: `0 0 12px ${spo2Color}60` } as any} />
            <span className="font-mono text-[8px] font-bold text-muted-foreground">%SpO₂</span>
          </div>
        </div>
      </GlassVitalCard>

      {/* ── BODY TEMPERATURE ───────────────────────────────────── */}
      <GlassVitalCard borderColor={`${tempColor}30`} glowColor={`${tempColor}20`} scanColor="#E35336">
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: tempColor, boxShadow: `0 0 6px ${tempColor}` }} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">{t("dashboard.bodyTemp", "Body Temperature")}</h3>
          </div>
          <motion.div animate={isHighTemp ? { rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}>
            <Thermometer className="h-4 w-4" style={{ color: tempColor }} />
          </motion.div>
        </div>
        <div className="flex items-end gap-2 mb-3 relative z-10">
          <AnimatedNumber value={temperature > 0 ? temperature : 0} decimals={1}
            className="font-display text-3xl md:text-4xl font-bold"
            style={{ color: tempColor, textShadow: `0 0 12px ${tempColor}60` } as any}
          />
          <span className="font-mono text-[10px] pb-1 font-bold text-muted-foreground">°C</span>
          {isHighTemp && <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
            className="font-mono text-[8px] uppercase tracking-widest pb-1 font-bold text-red-600 dark:text-red-500">⚠ HIGH</motion.span>}
        </div>
        {/* Progress bar */}
        <div className="relative z-10">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
            <motion.div className="h-full rounded-full" style={{
              background: `linear-gradient(to right, ${tempColor}80, ${tempColor})`,
              boxShadow: `0 0 10px ${tempColor}80`,
            }} initial={{ width: "0%" }} animate={{ width: `${tempPct}%` }} transition={{ duration: 1.2 }} />
          </div>
          <div className="flex justify-between mt-1 text-muted-foreground">
            <span className="font-mono text-[8px]">34°C</span>
            <span className="font-mono text-[8px]">42°C</span>
          </div>
        </div>
      </GlassVitalCard>

      {/* ── BLOOD PRESSURE ─────────────────────────────────────── */}
      <GlassVitalCard borderColor="rgba(227,83,54,0.3)" glowColor="rgba(227,83,54,0.15)">
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#E35336", boxShadow: "0 0 6px rgba(227,83,54,0.7)" }} />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">{t("dashboard.bloodPressure", "Blood Pressure")}</h3>
        </div>
        <div className="flex items-end gap-1 relative z-10">
          <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {systolic || "--"}
          </span>
          <span className="font-mono text-lg pb-0.5 font-bold text-muted-foreground">/</span>
          <span className="font-display text-xl md:text-2xl font-bold text-foreground/80">
            {diastolic || "--"}
          </span>
          <span className="font-mono text-[9px] pb-1 ml-1 font-bold text-muted-foreground">mmHg</span>
        </div>
        <div className="flex gap-1 mt-2 relative z-10">
          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase" style={{
            background: "rgba(227,83,54,0.12)", border: "1px solid rgba(227,83,54,0.3)", color: "#E35336"
          }}>
            {systolic > 130 ? t("dashboard.elevated", "ELEVATED") : systolic > 0 ? t("dashboard.normal", "NORMAL") : "N/A"}
          </span>
        </div>
      </GlassVitalCard>

      {/* ── STRESS LEVEL ──────────────────────────────────────── */}
      <GlassVitalCard borderColor="rgba(168,85,247,0.3)" glowColor="rgba(168,85,247,0.15)">
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#9333ea", boxShadow: "0 0 6px #9333ea" }} />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">{t("dashboard.stressLevel", "Stress Level")}</h3>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="font-display text-xl font-bold uppercase text-purple-600 dark:text-purple-400">
            {String(t(`dashboard.${stressLevel.toLowerCase()}`, stressLevel))}
          </span>
        </div>
        {/* Stress bar */}
        <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden relative z-10 bg-muted">
          <motion.div className="h-full rounded-full" style={{
            background: "linear-gradient(to right, #22C55E, #EAB308, #EF4444)",
            boxShadow: "0 0 8px rgba(168,85,247,0.5)",
          }} initial={{ width: "0%" }} animate={{ width: stressLevel === "high" ? "85%" : stressLevel === "moderate" ? "55%" : "25%" }}
            transition={{ duration: 1.5 }}
          />
        </div>
      </GlassVitalCard>
    </div>
  );
}
