import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Activity,
  Heart,
  Zap,
  Wind,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Cpu,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ChamberData {
  id: number;
  key: string;
  name: string;
  role: string;
  anatomicalName: string;
  pressure: string;
  oxygen: string;
  electricalPhase: string;
  clinicalTier: string;
  accentColor: string;
  glowColor: string;
  bgGlow: string;
  ecgSegment: "P" | "PR" | "QRS" | "T";
  description: string;
  clinicalImpact: string;
  metrics: { label: string; value: string; unit: string }[];
}

export default function CardiacChambersScrollytelling() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualChamber, setManualChamber] = useState<number | null>(null);

  // Scroll scrub tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.3
  });

  // Calculate active chamber based on scroll position (0..3)
  const scrollChamberIndex = useTransform(smoothProgress, [0, 0.28, 0.62, 0.95], [0, 1, 2, 3]);
  const [activeIdx, setActiveIdx] = useState(0);

  React.useEffect(() => {
    return scrollChamberIndex.on("change", (latest) => {
      if (manualChamber === null) {
        const idx = Math.min(3, Math.max(0, Math.round(latest)));
        setActiveIdx(idx);
      }
    });
  }, [scrollChamberIndex, manualChamber]);

  const chambers: ChamberData[] = [
    {
      id: 0,
      key: "chamber1",
      name: t("phc.chamber1Name", "Chamber I: Right Atrium & SA Node"),
      role: t("phc.chamber1Role", "Bioelectric Pulse Trigger & Pacemaker"),
      anatomicalName: "Atrium Dextrum & Nodus Sinoatrialis",
      pressure: "2 – 6 mmHg",
      oxygen: "75% Deoxygenated",
      electricalPhase: "P-Wave • SA Node Depolarization",
      clinicalTier: "TIER 01: 250 Hz BLE SENSOR FUSION",
      accentColor: "#00F5D4",
      glowColor: "rgba(0, 245, 212, 0.45)",
      bgGlow: "from-[#00F5D4]/20 via-[#0D9488]/10 to-transparent",
      ecgSegment: "P",
      description: t(
        "phc.chamber1Desc",
        "Sinoatrial node generates natural 60–100 BPM rhythm. HealthPulse AI taps optical photoplethysmography (PPG) at 250 Hz to monitor beat-to-beat HRV variability."
      ),
      clinicalImpact: "Captures microvascular pulse transit time and sympathetic nervous tone at microsecond resolution.",
      metrics: [
        { label: "PACEMAKER RATE", value: "72", unit: "BPM" },
        { label: "SAMPLING ADC", value: "16-BIT", unit: "250 Hz" },
        { label: "HRV VARIABILITY", value: "78", unit: "ms" }
      ]
    },
    {
      id: 1,
      key: "chamber2",
      name: t("phc.chamber2Name", "Chamber II: Right Ventricle & Pulmonary Circuit"),
      role: t("phc.chamber2Role", "Deoxygenated Blood to Lungs & Diffusion Imputation"),
      anatomicalName: "Ventriculus Dexter & Truncus Pulmonalis",
      pressure: "15 – 25 mmHg",
      oxygen: "75% → 98% In Transit",
      electricalPhase: "PR-Segment • AV Delay & Ventricular Influx",
      clinicalTier: "TIER 02: CSDI NEURAL DIFFUSION",
      accentColor: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.45)",
      bgGlow: "from-sky-500/20 via-cyan-600/10 to-transparent",
      ecgSegment: "PR",
      description: t(
        "phc.chamber2Desc",
        "Pumps venous blood to pulmonary capillaries. CSDI Neural Diffusion algorithm detects motion artifacts and reconstructs missing telemetry with 98.55% fidelity."
      ),
      clinicalImpact: "Cleanses perspiration noise, sensor decoupling, and movement spikes before machine learning inference.",
      metrics: [
        { label: "PULMONARY FLOW", value: "5.2", unit: "L/min" },
        { label: "DIFFUSION PASSES", value: "10", unit: "Iter" },
        { label: "RECONSTRUCTION", value: "98.55", unit: "%" }
      ]
    },
    {
      id: 2,
      key: "chamber3",
      name: t("phc.chamber3Name", "Chamber III: Left Atrium & Mitral Valve"),
      role: t("phc.chamber3Role", "Oxygenated Blood Return & Microvascular Vitals"),
      anatomicalName: "Atrium Sinistrum & Valva Bicuspidalis",
      pressure: "4 – 12 mmHg",
      oxygen: "99% Pure Arterial",
      electricalPhase: "Pre-Systolic Influx • Atrial Kick",
      clinicalTier: "TIER 03: CLINICAL DIGITAL TWIN",
      accentColor: "#F43F5E",
      glowColor: "rgba(244, 63, 94, 0.45)",
      bgGlow: "from-rose-500/20 via-pink-600/10 to-transparent",
      ecgSegment: "T",
      description: t(
        "phc.chamber3Desc",
        "Receives purified oxygenated blood from lungs. System dynamically calibrates 99% SpO2 levels and systemic vascular resistance across all peripheral sensors."
      ),
      clinicalImpact: "Calculates real-time allostatic stress, arterial compliance, and cellular oxygen transport efficiency.",
      metrics: [
        { label: "SPO2 SATURATION", value: "99", unit: "%" },
        { label: "CORE STRESS", value: "18", unit: "/100" },
        { label: "END-DIASTOLIC VOL", value: "120", unit: "mL" }
      ]
    },
    {
      id: 3,
      key: "chamber4",
      name: t("phc.chamber4Name", "Chamber IV: Left Ventricle & Aorta Systemic Delivery"),
      role: t("phc.chamber4Role", "High-Pressure Systolic Surge & Sub-Second Dispatch"),
      anatomicalName: "Ventriculus Sinister & Arcus Aortae",
      pressure: "120 / 80 mmHg",
      oxygen: "99% Peak Arterial Surge",
      electricalPhase: "QRS Complex • Giant Systolic Contraction",
      clinicalTier: "TIER 04: AUTONOMOUS PHC DISPATCH",
      accentColor: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.5)",
      bgGlow: "from-purple-500/25 via-indigo-600/10 to-transparent",
      ecgSegment: "QRS",
      description: t(
        "phc.chamber4Desc",
        "Massive muscular contraction pumps life-saving oxygen to the entire body. If arrhythmia or hypoxia spikes, autonomous PHC geofencing mobilizes emergency dispatch."
      ),
      clinicalImpact: "Sub-second emergency telemetry ring automatically alerts nearest district ICU and PHC ambulances.",
      metrics: [
        { label: "SYSTOLIC PRESSURE", value: "120", unit: "mmHg" },
        { label: "CARDIAC OUTPUT", value: "6.8", unit: "L/min" },
        { label: "DISPATCH LATENCY", value: "<800", unit: "ms" }
      ]
    }
  ];

  const currentChamber = chambers[manualChamber !== null ? manualChamber : activeIdx];

  const handleSelectChamber = (idx: number) => {
    setManualChamber(idx);
    setActiveIdx(idx);
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[280vh] w-full transition-colors duration-300"
    >
      {/* ── STICKY VIEWPORT CONTAINER ── */}
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col justify-between py-4 px-4 sm:px-8 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#0D9488] dark:text-[#00F5D4] uppercase">
              <Heart className="w-3.5 h-3.5 animate-pulse text-[#00F5D4]" />
              <span>02 // CARDIAC CONDUCTION SCROLLYTELLING</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {t("phc.heartChambersTitle", "Cardiovascular 4-Chamber Conduction Architecture")}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl hidden sm:block">
              {t("phc.heartChambersSubtitle", "Scroll to journey through the cardiac cycle — from Sinoatrial pacemaker pulse to systemic aortic AI dispatch")}
            </p>
          </div>

          {/* Chamber Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 font-mono text-xs">
            {chambers.map((c, i) => {
              const isActive = (manualChamber !== null ? manualChamber : activeIdx) === i;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectChamber(i)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-[#00F5D4] dark:text-slate-950 shadow-md scale-105"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  CHAMBER {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CENTRAL SCROLLYTELLING STAGE: ANATOMICAL HEART + CLINICAL HUD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-2">
          
          {/* Left Column (5 Cols): Animated Glowing SVG Anatomical Heart with 4 Distinct Chambers */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Ambient Bioluminescent Chamber Aura */}
            <div
              className="absolute inset-0 rounded-full blur-[90px] opacity-40 pointer-events-none transition-all duration-700"
              style={{ background: currentChamber.glowColor }}
            />

            {/* Heart Glass Shield */}
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] p-4 sm:p-6 rounded-[2.5rem] bg-white/70 dark:bg-black/50 border border-slate-200/90 dark:border-white/15 shadow-2xl backdrop-blur-xl">
              
              {/* Badge above Heart */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-2 border-b border-slate-200/60 dark:border-white/10 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-[#0D9488] dark:text-[#00F5D4]">
                  <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
                  BIO_CARDIAC_3D // 4-CHAMBER
                </span>
                <span className="text-slate-500 dark:text-slate-400">ACTIVE: CH-{currentChamber.id + 1}</span>
              </div>

              {/* ── ANATOMICAL SVG HEART WITH 4 INTERACTIVE GLOWING CHAMBERS ── */}
              <div className="relative h-[250px] sm:h-[300px] flex items-center justify-center">
                <svg
                  viewBox="0 0 360 400"
                  className="w-full h-full drop-shadow-[0_0_35px_rgba(0,245,212,0.25)] select-none"
                >
                  {/* Outer Background Myocardium Contour */}
                  <path
                    d="M 180 370 C 130 320 60 250 50 170 C 40 100 95 65 150 90 C 170 100 180 115 180 115 C 180 115 190 100 210 90 C 265 65 320 100 310 170 C 300 250 230 320 180 370 Z"
                    fill="rgba(15, 23, 42, 0.15)"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="2"
                    className="dark:fill-slate-950/60 dark:stroke-white/15"
                  />

                  {/* ── ASCENDING AORTA & AORTIC ARCH (Great Vessel) ── */}
                  <g className="transition-opacity duration-500">
                    <path
                      d="M 170 115 C 160 50 210 20 250 35 C 275 45 280 80 260 115"
                      fill="none"
                      stroke={currentChamber.id === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"}
                      strokeWidth={currentChamber.id === 3 ? "14" : "10"}
                      strokeLinecap="round"
                    />
                    {/* Aortic Arch 3 Branches (Brachiocephalic, Carotid, Subclavian) */}
                    <line x1="215" y1="28" x2="215" y2="10" stroke={currentChamber.id === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="4" strokeLinecap="round" />
                    <line x1="235" y1="30" x2="238" y2="10" stroke={currentChamber.id === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="4" strokeLinecap="round" />
                    <line x1="252" y1="38" x2="260" y2="12" stroke={currentChamber.id === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="4" strokeLinecap="round" />
                  </g>

                  {/* ── PULMONARY ARTERY (Branch to Lungs) ── */}
                  <path
                    d="M 195 125 C 190 75 140 60 100 70"
                    fill="none"
                    stroke={currentChamber.id === 1 ? "#38BDF8" : "rgba(56, 189, 248, 0.4)"}
                    strokeWidth={currentChamber.id === 1 ? "12" : "8"}
                    strokeLinecap="round"
                  />

                  {/* ── SUPERIOR VENA CAVA ── */}
                  <path
                    d="M 110 50 L 110 115"
                    stroke={currentChamber.id === 0 ? "#00F5D4" : "rgba(0, 245, 212, 0.4)"}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* ── CHAMBER 1: RIGHT ATRIUM (Upper Anatomical Right / Viewer Left) ── */}
                  <g onClick={() => handleSelectChamber(0)} className="cursor-pointer group">
                    <motion.path
                      d="M 105 120 C 70 125 60 170 85 200 C 115 210 135 190 145 160 C 150 135 130 118 105 120 Z"
                      fill={currentChamber.id === 0 ? "rgba(0, 245, 212, 0.35)" : "rgba(0, 245, 212, 0.08)"}
                      stroke={currentChamber.id === 0 ? "#00F5D4" : "rgba(0, 245, 212, 0.3)"}
                      strokeWidth={currentChamber.id === 0 ? "3.5" : "1.5"}
                      animate={currentChamber.id === 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    />
                    {/* Sinoatrial (SA) Node Pulsing Pacemaker Rings */}
                    <circle cx="108" cy="130" r="6" fill="#00F5D4" className="drop-shadow-[0_0_10px_#00F5D4]" />
                    <motion.circle
                      cx="108"
                      cy="130"
                      r="14"
                      fill="none"
                      stroke="#00F5D4"
                      strokeWidth="2"
                      animate={{ scale: [1, 2], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "easeOut" }}
                    />
                    <text x="75" y="165" fill={currentChamber.id === 0 ? "#00F5D4" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
                      RA • 72 BPM
                    </text>
                  </g>

                  {/* ── CHAMBER 2: RIGHT VENTRICLE (Lower Anatomical Right / Viewer Left-Center) ── */}
                  <g onClick={() => handleSelectChamber(1)} className="cursor-pointer group">
                    <motion.path
                      d="M 95 210 C 80 250 120 310 160 340 C 175 300 175 240 160 210 C 140 205 110 205 95 210 Z"
                      fill={currentChamber.id === 1 ? "rgba(56, 189, 248, 0.35)" : "rgba(56, 189, 248, 0.08)"}
                      stroke={currentChamber.id === 1 ? "#38BDF8" : "rgba(56, 189, 248, 0.3)"}
                      strokeWidth={currentChamber.id === 1 ? "3.5" : "1.5"}
                      animate={currentChamber.id === 1 ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                    />
                    <text x="110" y="270" fill={currentChamber.id === 1 ? "#38BDF8" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
                      RV • 25 mmHg
                    </text>
                  </g>

                  {/* ── CHAMBER 3: LEFT ATRIUM (Upper Anatomical Left / Viewer Right) ── */}
                  <g onClick={() => handleSelectChamber(2)} className="cursor-pointer group">
                    <motion.path
                      d="M 220 125 C 260 125 285 160 265 195 C 240 205 215 195 205 165 C 200 140 210 125 220 125 Z"
                      fill={currentChamber.id === 2 ? "rgba(244, 63, 94, 0.35)" : "rgba(244, 63, 94, 0.08)"}
                      stroke={currentChamber.id === 2 ? "#F43F5E" : "rgba(244, 63, 94, 0.3)"}
                      strokeWidth={currentChamber.id === 2 ? "3.5" : "1.5"}
                      animate={currentChamber.id === 2 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }}
                    />
                    <text x="220" y="165" fill={currentChamber.id === 2 ? "#F43F5E" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
                      LA • 99% SpO2
                    </text>
                  </g>

                  {/* ── CHAMBER 4: LEFT VENTRICLE (Lower Anatomical Left / Thickest Muscle Apex) ── */}
                  <g onClick={() => handleSelectChamber(3)} className="cursor-pointer group">
                    <motion.path
                      d="M 180 215 C 190 250 200 300 180 365 C 225 320 270 260 255 210 C 230 205 200 205 180 215 Z"
                      fill={currentChamber.id === 3 ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.08)"}
                      stroke={currentChamber.id === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.3)"}
                      strokeWidth={currentChamber.id === 3 ? "4" : "1.5"}
                      animate={currentChamber.id === 3 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.6 }}
                    />
                    <text x="195" y="280" fill={currentChamber.id === 3 ? "#A855F7" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
                      LV • 120 mmHg
                    </text>
                  </g>

                  {/* ── ELECTRICAL CONDUCTION PATHWAYS (BUNDLE OF HIS & PURKINJE NETWORK) ── */}
                  <g className="pointer-events-none">
                    <line x1="108" y1="130" x2="165" y2="190" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="165" cy="190" r="3.5" fill="#FACC15" />
                    <line x1="165" y1="190" x2="175" y2="280" stroke="#FACC15" strokeWidth="2" strokeDasharray="4 2" />
                    <path d="M 175 280 L 130 320 M 175 280 L 220 330" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="2 3" />
                  </g>
                </svg>
              </div>

              {/* Synchronized ECG Waveform Ribbon */}
              <div className="mt-3 p-2.5 rounded-2xl bg-slate-900 dark:bg-black/80 border border-slate-800 dark:border-white/10 text-white">
                <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                  <span className="flex items-center gap-1 font-bold text-[#00F5D4]">
                    <Activity className="w-3 h-3 text-[#00F5D4]" />
                    {currentChamber.electricalPhase}
                  </span>
                  <span className="text-slate-400">LEAD-II ECG WAVE</span>
                </div>
                <div className="h-8 w-full flex items-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                    <path
                      d="M 0 20 L 60 20 L 75 10 L 85 20 L 130 20 L 140 28 L 150 4 L 160 34 L 170 20 L 210 20 L 230 12 L 250 20 L 400 20"
                      fill="none"
                      stroke={currentChamber.accentColor}
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (7 Cols): Dynamic Chamber Clinical Intelligence Card */}
          <div className="lg:col-span-7 space-y-4">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChamber.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 rounded-[2rem] bg-white/85 dark:bg-[#0D131A]/90 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-5"
              >
                {/* Header Tag & Clinical Tier */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full animate-ping"
                      style={{ backgroundColor: currentChamber.accentColor }}
                    />
                    <span
                      className="font-mono text-xs font-bold tracking-widest uppercase"
                      style={{ color: currentChamber.accentColor }}
                    >
                      {currentChamber.clinicalTier}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {currentChamber.anatomicalName}
                  </span>
                </div>

                {/* Big Editorial Chamber Title */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentChamber.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    {currentChamber.role}
                  </p>
                </div>

                {/* Chamber Clinical Explanation */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentChamber.description}
                </p>

                {/* Real-Time Chamber Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {currentChamber.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-black/50 border border-slate-200/80 dark:border-white/10"
                    >
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                        {m.label}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                          {m.value}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Physiological Action Footer */}
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0D9488] dark:text-[#00F5D4] shrink-0" />
                    <span className="font-medium text-[11px]">{currentChamber.clinicalImpact}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#0D9488] dark:text-[#00F5D4] shrink-0 ml-2">
                    {currentChamber.pressure}
                  </span>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-slate-200/80 dark:border-white/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00F5D4]" />
            CARDIAC SYSTOLE / DIASTOLE TELEMETRY HARNESSED IN REAL TIME
          </span>
          <span className="hidden sm:inline">CYCLE STAGE: {currentChamber.id + 1} OF 4</span>
        </div>

      </div>
    </section>
  );
}
