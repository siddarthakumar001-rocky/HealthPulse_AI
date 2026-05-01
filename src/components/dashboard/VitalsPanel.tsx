import { useTranslation } from "react-i18next";
import { Heart, Thermometer, Wind } from "lucide-react";
import { motion, useSpring, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface VitalsPanelProps {
  heartRate: number;
  spo2: number;
  temperature: number;
}

/** Animated number count-up using Framer Motion */
function AnimatedNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const motionVal = useMotionValue(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    const unsubscribe = motionVal.on("change", (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v.toFixed(decimals);
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, decimals]);

  return (
    <span ref={nodeRef} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}

export default function VitalsPanel({ heartRate, spo2, temperature }: VitalsPanelProps) {
  const { t } = useTranslation();
  const hrColor =
    heartRate > 100 || (heartRate > 0 && heartRate < 50)
      ? "text-destructive neon-text-pink"
      : "text-green-600 dark:text-green-400 dark:neon-text-green";
  const spo2Color =
    spo2 > 0 && spo2 < 95 ? "text-orange-500" : "text-cyan-600 dark:text-cyan-400 dark:neon-text-cyan";
  const isHighTemp = temperature > 37.5;

  // SpO2 SVG ring — viewBox 128×128, cx=64, cy=64, r=54
  // circumference = 2π × 54 ≈ 339.29
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  const spo2Dash = CIRCUMFERENCE - (CIRCUMFERENCE * Math.min(spo2 || 0, 100)) / 100;

  // Temperature bar percentage: range 34°C–42°C → 0%–100%
  const tempPct = temperature > 0
    ? Math.min(100, Math.max(0, ((temperature - 34) / 8) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* ── HEART RATE ─────────────────────────────────────────── */}
      <motion.div
        className="liquid-glass rounded-2xl p-6 group relative cursor-default"
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ borderColor: "rgba(0,255,102,0.2)" }}
      >
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-bold">
              {t("dashboard.heartRate")}
            </h3>
            <div className="flex items-end gap-2">
              <AnimatedNumber
                value={heartRate || 0}
                className={`font-display text-5xl font-bold ${hrColor}`}
              />
              <span className="font-mono text-xs text-foreground/80 pb-2 font-bold">{t("dashboard.bpm")}</span>
            </div>
          </div>
          <motion.div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,255,102,0.08)",
              border: "1px solid rgba(0,255,102,0.2)",
            }}
            animate={heartRate > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 60 / Math.max(heartRate, 60), repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart
              className={`h-5 w-5 ${heartRate > 0 ? "" : "opacity-30"} ${
                heartRate > 100 ? "text-destructive" : "text-green-400"
              }`}
            />
          </motion.div>
        </div>

        <div className="scan-line" />

        {/* Animated waveform */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
            {heartRate > 0 ? (
              <motion.path
                d="M 0 20 L 18 20 L 22 8 L 26 32 L 30 20 L 50 20 L 68 20 L 72 8 L 76 32 L 80 20 L 100 20"
                fill="none"
                stroke="rgba(0,255,102,1)"
                strokeWidth="2"
                initial={{ pathLength: 0, x: -100 }}
                animate={{ pathLength: 1, x: 0 }}
                transition={{
                  duration: Math.max(0.4, 60 / Math.max(heartRate, 1)),
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : (
              <path d="M 0 20 L 100 20" fill="none" stroke="rgba(0,255,102,0.3)" strokeWidth="1" />
            )}
          </svg>
        </div>
      </motion.div>

      {/* ── SpO2 ───────────────────────────────────────────────── */}
      <motion.div
        className="liquid-glass rounded-2xl p-6 relative"
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ borderColor: "rgba(0,243,255,0.2)" }}
      >
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {t("dashboard.spo2")}
          </h3>
          <Wind className={`h-5 w-5 ${spo2Color}`} />
        </div>

        <div className="scan-line" />

        <div className="flex items-center justify-center relative z-10">
          {/* SVG with correct viewBox so circle never clips */}
          <svg
            viewBox="0 0 128 128"
            className="w-full max-w-[136px] aspect-square"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Track ring */}
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="rgba(0, 243, 255, 0.1)"
              strokeWidth="8"
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke={spo2 > 0 && spo2 < 95 ? "#f97316" : "#00f3ff"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: spo2Dash }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="spo2-glow"
            />
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatedNumber
              value={spo2 || 0}
              className={`font-display text-4xl font-bold ${spo2Color}`}
            />
            <span className="font-mono text-[10px] text-foreground/80 font-bold">%SpO₂</span>
          </div>
        </div>
      </motion.div>

      {/* ── BODY TEMPERATURE ────────────────────────────────────── */}
      <motion.div
        className="liquid-glass rounded-2xl p-6 relative"
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ borderColor: "rgba(251,146,60,0.2)" }}
      >
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {t("dashboard.bodyTemp")}
          </h3>
          <motion.div
            animate={isHighTemp ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Thermometer className={`h-5 w-5 ${isHighTemp ? "text-red-400" : "text-orange-400"}`} />
          </motion.div>
        </div>

        <div className="scan-line" />

        <div className="flex items-end gap-2 mb-5 relative z-10">
          <AnimatedNumber
            value={temperature > 0 ? temperature : 0}
            decimals={1}
            className={`font-display text-5xl font-bold ${isHighTemp ? "text-red-400 neon-text-pink" : "text-orange-400 neon-text-orange"}`}
          />
          <span className="font-mono text-xs text-foreground/80 pb-2 font-bold">°C</span>
          {isHighTemp && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-[9px] text-red-400 uppercase tracking-widest pb-2 font-bold"
            >
              HIGH
            </motion.span>
          )}
        </div>

        {/* Animated progress bar */}
        <div className="relative z-10">
          <div className="w-full h-2.5 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isHighTemp ? "temp-high-glow" : ""}`}
              style={{
                background: isHighTemp
                  ? "linear-gradient(to right, #f97316, #ef4444)"
                  : "linear-gradient(to right, #ea580c, #fb923c)",
                boxShadow: isHighTemp
                  ? "0 0 12px rgba(239,68,68,0.8)"
                  : "0 0 10px rgba(251,146,60,0.7)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${tempPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          {/* Range labels */}
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[9px] text-foreground/60">34°C</span>
            <span className="font-mono text-[9px] text-foreground/60">42°C</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
