import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  Cpu,
  Heart,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
  SlidersHorizontal,
  Flame,
  Wind,
  Thermometer,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Globe,
  CheckCircle2,
  Lock,
  ChevronDown,
  RefreshCw,
  Clock,
  Compass,
  FileText,
  Smartphone,
  Eye,
  Hospital
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import LiquidCursor from "@/components/LiquidCursor";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

// Biometric Simulation Presets for live interactive demonstration
type SimulationMode = "resting" | "exercise" | "arrhythmia" | "sleep";

interface PresetState {
  label: string;
  sub: string;
  bpm: number;
  spo2: number;
  temp: number;
  stress: number;
  status: string;
  statusColor: string;
  ecgSpeed: number;
  ecgColor: string;
  twinAura: string;
  aiInsight: string;
}

const PRESETS: Record<SimulationMode, PresetState> = {
  resting: {
    label: "Normal Resting",
    sub: "Homeostatic equilibrium",
    bpm: 72,
    spo2: 99,
    temp: 36.6,
    stress: 18,
    status: "All Systems Nominal",
    statusColor: "text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/25",
    ecgSpeed: 2.2,
    ecgColor: "#00F5D4",
    twinAura: "rgba(0, 245, 212, 0.22)",
    aiInsight: "Autonomic nervous balance optimal. Sinus rhythm shows 78ms HRV variability."
  },
  exercise: {
    label: "Cardio Demand",
    sub: "Sympathetic activation",
    bpm: 142,
    spo2: 96,
    temp: 37.4,
    stress: 64,
    status: "Elevated Metabolic Load",
    statusColor: "text-amber-400 bg-amber-400/10 border-amber-400/25",
    ecgSpeed: 1.1,
    ecgColor: "#F59E0B",
    twinAura: "rgba(245, 158, 11, 0.28)",
    aiInsight: "Cardiac output 8.4 L/min. Coronary perfusion adequate. Oxygen debt compensating."
  },
  arrhythmia: {
    label: "Anomaly Detected",
    sub: "CSDI Denoising Active",
    bpm: 114,
    spo2: 93,
    temp: 36.9,
    stress: 86,
    status: "Telemetry Artifact Imputed",
    statusColor: "text-rose-400 bg-rose-400/10 border-rose-400/25",
    ecgSpeed: 1.5,
    ecgColor: "#F43F5E",
    twinAura: "rgba(244, 63, 94, 0.3)",
    aiInsight: "Premature ventricular contraction detected. CSDI diffusion restored 18 missing packets."
  },
  sleep: {
    label: "Deep Sleep Recovery",
    sub: "Parasympathetic regeneration",
    bpm: 54,
    spo2: 99,
    temp: 36.2,
    stress: 8,
    status: "Cellular Anabolism Active",
    statusColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
    ecgSpeed: 3.2,
    ecgColor: "#38BDF8",
    twinAura: "rgba(56, 189, 248, 0.2)",
    aiInsight: "Delta brainwave synchronization. Growth hormone release and HRV restoration peak."
  }
};

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<SimulationMode>("resting");
  const [selectedOrgan, setSelectedOrgan] = useState<string>("heart");
  const [signalMode, setSignalMode] = useState<"denoised" | "corrupted">("denoised");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const current = PRESETS[mode];

  // ── SCROLL SCRUB HOOKS ──
  const { scrollY } = useScroll();
  
  // 1. Sticky Navigation Bar Transition: transparent -> subtle frosted-glass blur
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(7, 10, 13, 0)", "rgba(7, 10, 13, 0.88)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.12)"]
  );
  const navShadow = useTransform(
    scrollY,
    [0, 100],
    ["none", "0 20px 40px -15px rgba(0,0,0,0.8)"]
  );

  // 2. Hero Cinematic Scroll-Scrub Reveal
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.94]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0.4]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -30]);

  // 3. Pinned Horizontal Gallery Section: tight, responsive scrub
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalSectionRef,
    offset: ["start start", "end end"]
  });

  const smoothHorizontal = useSpring(horizontalProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.2
  });

  // Moves 4 modular cards horizontally across screen width
  const horizontalX = useTransform(smoothHorizontal, [0, 1], ["0%", "-68%"]);
  const activeStep = useTransform(smoothHorizontal, [0, 0.33, 0.66, 1], [1, 2, 3, 4]);

  return (
    <div className="relative min-h-screen w-full bg-[#070A0D] text-[#F8FAFC] font-sans selection:bg-[#00F5D4]/25 overflow-x-hidden">
      <LiquidCursor />

      {/* ── AMBIENT ORGANIC BACKGROUND CANVAS ── */}
      <AntiGravityBackground />

      {/* Subtle Dark Luxury Obsidian Grain & Radial Light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-[#00F5D4]/12 via-[#0D9488]/6 to-transparent blur-[140px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#05D3B3]/8 blur-[160px] opacity-40" />
      </div>

      {/* ════════════════════════════════════════════════════════════
          1. STICKY NAVIGATION BAR (TRANSPARENT -> FROSTED GLASS BLUR)
      ════════════════════════════════════════════════════════════ */}
      <motion.nav
        style={{
          backgroundColor: navBackground,
          borderColor: navBorder,
          boxShadow: navShadow,
        }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 h-20 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-300"
      >
        {/* Brand Logo & Editorial Wordmark */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F5D4]/20 via-[#0D9488]/30 to-black/60 border border-[#00F5D4]/40 flex items-center justify-center shadow-lg shadow-[#00F5D4]/15 group-hover:scale-105 transition-transform duration-300">
            <Heart className="w-5 h-5 text-[#00F5D4] animate-pulse drop-shadow-[0_0_10px_#00F5D4]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
              HEALTHPULSE <span className="text-[#00F5D4]">AI</span>
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#94A3B8] uppercase">
              BIOMETRIC SCROLLYTELLING
            </span>
          </div>
        </Link>

        {/* Center Live Node Indicator */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[11px] tracking-wider text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
          <span>IOMT BLE TELEMETRY ACTIVE • 250 HZ</span>
        </div>

        {/* Actions & Locale Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher />

          <Button
            variant="ghost"
            asChild
            className="text-xs font-mono tracking-widest uppercase text-[#94A3B8] hover:text-white hover:bg-white/[0.05] hidden md:inline-flex rounded-xl"
          >
            <Link to="/login">{t("landing.logIn", "SIGN IN")}</Link>
          </Button>

          <Button
            asChild
            className="mermaid-btn text-xs font-mono tracking-widest uppercase h-10 px-5 rounded-xl text-black font-extrabold shadow-lg shadow-[#00F5D4]/20 hover:scale-105 active:scale-95 transition-all hidden md:inline-flex"
          >
            <Link to="/signup">
              <span>{t("landing.getStarted", "ACCESS HUD")}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════════════════════════
          2. HERO SECTION: CINEMATIC SCROLL-SCRUB REVEAL
      ════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative pt-28 sm:pt-36 pb-16 px-4 sm:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            y: heroY,
            willChange: "transform, opacity"
          }}
          className="relative mermaid-glass p-6 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Subtle Scanning Laser Line */}
          <motion.div
            className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F5D4] to-transparent opacity-80 shadow-[0_0_20px_#00F5D4] pointer-events-none z-30"
            animate={{ top: ["2%", "98%", "2%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 6 Columns: Editorial Typography & Biometric Modes */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Monospace Metadata Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-[#00F5D4] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>01 // DIGITAL TWIN • CLINICAL TELEMETRY</span>
              </div>

              {/* Bold Oversized Editorial Display Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.035em] leading-[0.98] text-white">
                Autonomous <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] via-[#05D3B3] to-white drop-shadow-[0_4px_30px_rgba(0,245,212,0.35)]">
                  Biological
                </span> <br />
                Intelligence.
              </h1>

              {/* Editorial Body Text */}
              <p className="text-base sm:text-lg text-[#94A3B8] font-light leading-relaxed max-w-lg">
                Continuous physiological sensor fusion merges raw Lead-II optical wave telemetry with CSDI neural diffusion imputation to predict and stop health anomalies before symptoms manifest.
              </p>

              {/* ── INTERACTIVE SIMULATOR PRESETS ── */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#00F5D4]" />
                    SIMULATE PHYSIOLOGY:
                  </span>
                  <span className="text-[#00F5D4] font-bold">{current.label}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(PRESETS) as SimulationMode[]).map((key) => {
                    const preset = PRESETS[key];
                    const active = mode === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={`p-2.5 rounded-2xl text-left transition-all duration-300 border ${
                          active
                            ? "bg-[#00F5D4]/10 border-[#00F5D4] text-white shadow-lg shadow-[#00F5D4]/15 scale-[1.02]"
                            : "bg-white/[0.02] border-white/10 text-[#94A3B8] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{preset.label}</div>
                        <div className="text-[9px] font-mono opacity-80">{preset.bpm} BPM • {preset.spo2}%</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="mermaid-btn h-14 px-8 rounded-2xl text-xs font-mono tracking-widest uppercase text-black font-extrabold shadow-xl shadow-[#00F5D4]/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <Link to="/signup" className="flex items-center gap-2">
                    <span>INITIALIZE SCAN</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="h-14 px-6 rounded-2xl text-xs font-mono tracking-widest uppercase border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  VIEW CLINICAL HUD
                </Button>
              </div>

              {/* Status Banner */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${current.statusColor} backdrop-blur-md`}>
                <Radio className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <span className="font-bold">{current.status}: </span>
                  <span className="opacity-90">{current.aiInsight}</span>
                </div>
              </div>

            </div>

            {/* Right 6 Columns: Holographic Bio-Twin & Orbiting Telemetry Gauges */}
            <div className="lg:col-span-6 relative">
              
              {/* Outer Ambient Radial Glow */}
              <div
                className="absolute inset-0 rounded-full blur-[100px] pointer-events-none transition-all duration-700"
                style={{ background: current.twinAura }}
              />

              {/* Bio-Twin Stage Container */}
              <div className="relative rounded-[2rem] bg-black/40 border border-white/10 p-5 sm:p-7 backdrop-blur-2xl overflow-hidden shadow-2xl">
                
                {/* Header Metadata */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-[10px] font-mono text-[#94A3B8]">
                  <span className="flex items-center gap-2 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
                    HDT_MODEL // LIVE_TELEMETRY
                  </span>
                  <span>ADC: 16-BIT • SAMPLING: 250HZ</span>
                </div>

                {/* Central Anatomical SVG with Orbiting Telemetry Cards */}
                <div className="relative h-[340px] sm:h-[380px] flex items-center justify-center">
                  
                  <svg viewBox="0 0 240 400" className="w-full h-full max-h-[340px] drop-shadow-[0_0_25px_rgba(0,245,212,0.3)]">
                    {/* Head / Brain Cortex */}
                    <circle
                      cx="120"
                      cy="45"
                      r="25"
                      fill="rgba(0, 245, 212, 0.08)"
                      stroke={selectedOrgan === "brain" ? "#00F5D4" : "rgba(0, 245, 212, 0.4)"}
                      strokeWidth={selectedOrgan === "brain" ? "2.5" : "1.5"}
                    />
                    <motion.circle
                      cx="120"
                      cy="45"
                      r="12"
                      fill="none"
                      stroke="#00F5D4"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    />

                    {/* Spine / Telemetry Bus */}
                    <line x1="120" y1="70" x2="120" y2="240" stroke="rgba(0, 245, 212, 0.3)" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Torso Skeleton */}
                    <path
                      d="M 85 80 Q 60 140 75 220 L 165 220 Q 180 140 155 80 Z"
                      fill="rgba(0, 245, 212, 0.04)"
                      stroke="rgba(0, 245, 212, 0.35)"
                      strokeWidth="1.5"
                    />

                    {/* Heart Organ - Bioluminescent Beating Engine */}
                    <motion.circle
                      cx="120"
                      cy="125"
                      r="18"
                      fill={current.ecgColor}
                      animate={{
                        scale: [1, 1.3, 1.05, 1.38, 1],
                        opacity: [0.75, 1, 0.8, 1, 0.75],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 60 / current.bpm,
                        ease: "easeInOut",
                      }}
                      className="drop-shadow-[0_0_20px_currentColor]"
                      style={{ color: current.ecgColor }}
                    />
                    <motion.circle
                      cx="120"
                      cy="125"
                      r="32"
                      fill="none"
                      stroke={current.ecgColor}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      animate={{ scale: [1, 1.45], opacity: [0.8, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 60 / current.bpm,
                        ease: "easeOut",
                      }}
                    />

                    {/* Lungs */}
                    <motion.path
                      d="M 90 95 Q 75 130 90 160 Q 105 130 90 95 Z"
                      fill="rgba(6, 182, 212, 0.15)"
                      stroke="rgba(6, 182, 212, 0.4)"
                      strokeWidth="1.5"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M 150 95 Q 165 130 150 160 Q 135 130 150 95 Z"
                      fill="rgba(6, 182, 212, 0.15)"
                      stroke="rgba(6, 182, 212, 0.4)"
                      strokeWidth="1.5"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    />

                    {/* Limbs Structure */}
                    <path
                      d="M 85 90 L 50 170 L 40 240 M 155 90 L 190 170 L 200 240 M 95 220 L 90 350 M 145 220 L 150 350"
                      stroke="rgba(0, 245, 212, 0.25)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>

                  {/* ── ORBITING TELEMETRY POD 1: CARDIAC RATE ── */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    className="absolute top-2 left-0 mermaid-glass p-3 rounded-2xl shadow-xl w-36 border border-white/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span>CARDIO BPM</span>
                      <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-white">{current.bpm}</span>
                      <span className="text-xs font-bold text-rose-500 font-mono">BPM</span>
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY POD 2: SPO2 ── */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-2 right-0 mermaid-glass p-3 rounded-2xl shadow-xl w-36 border border-white/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span>SPO2 BLOOD</span>
                      <Wind className="w-3.5 h-3.5 text-[#00F5D4]" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-white">{current.spo2}</span>
                      <span className="text-xs font-bold text-[#00F5D4] font-mono">%</span>
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY POD 3: TEMPERATURE ── */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4.1, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-2 left-0 mermaid-glass p-3 rounded-2xl shadow-xl w-36 border border-white/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span>CORE TEMP</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-white">{current.temp}</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">°C</span>
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY POD 4: STRESS ── */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-2 right-0 mermaid-glass p-3 rounded-2xl shadow-xl w-36 border border-white/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span>ALLOSTATIC</span>
                      <Zap className="w-3.5 h-3.5 text-[#00F5D4]" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-white">{current.stress}</span>
                      <span className="text-xs font-mono text-[#94A3B8]">/100</span>
                    </div>
                  </motion.div>
                </div>

                {/* Continuous ECG Oscilloscope */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#00F5D4] font-bold">
                      <Activity className="w-3.5 h-3.5" /> LEAD-II SINUS OSCILLOSCOPE
                    </span>
                    <span>SPEED: {current.ecgSpeed}s/sweep</span>
                  </div>

                  <div className="h-14 w-full bg-black/60 rounded-xl overflow-hidden relative border border-white/10 flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="none">
                      <motion.path
                        d="M 0 30 L 80 30 L 95 15 L 105 45 L 115 10 L 125 50 L 135 30 L 250 30 L 265 15 L 275 45 L 285 10 L 295 50 L 305 30 L 420 30 L 435 15 L 445 45 L 455 10 L 465 50 L 475 30 L 600 30"
                        fill="none"
                        stroke={current.ecgColor}
                        strokeWidth="2.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ repeat: Infinity, duration: current.ecgSpeed, ease: "linear" }}
                      />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. PINNED HORIZONTAL LAYOUT (SCROLLYTELLING ARCHITECTURE)
          Container pinned below the navbar (top-20 h-[calc(100vh-5rem)])
          Translates horizontally as user scrolls down with zero top clipping!
      ════════════════════════════════════════════════════════════ */}
      <section
        ref={horizontalSectionRef}
        className="relative h-[220vh] w-full"
      >
        <div className="sticky top-20 h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col justify-between py-5 px-4 sm:px-8">
          
          {/* Pinned Section Header & Live Step Indicators */}
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-[#00F5D4] uppercase mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
                02 // SCROLLYTELLING CLINICAL ARCHITECTURE
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Four Modular Clinical Tiers.
              </h2>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {["01 FUSION", "02 CSDI", "03 DISPATCH", "04 VAULT"].map((step, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg border border-white/10 bg-white/[0.03] text-[#94A3B8] text-[10px] font-bold"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Horizontally Translating Card Gallery */}
          <div className="max-w-7xl mx-auto w-full my-auto overflow-visible">
            <motion.div
              style={{ x: horizontalX, willChange: "transform" }}
              className="flex gap-5 sm:gap-6 w-max"
            >
              
              {/* Card 1: Optical Sensor Fusion */}
              <div className="w-[82vw] sm:w-[420px] mermaid-glass p-5 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between shrink-0">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-[#00F5D4] uppercase">
                    MODULE // 01 • SENSOR FUSION
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    250 Hz Continuous Optical Telemetry
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Dual-channel photoplethysmography (PPG) fused with 16-bit Sigma-Delta ADC sampling extracts systemic vascular resistance and pulse transit time.
                  </p>
                </div>

                {/* Micro Visual inside Card */}
                <div className="my-2.5 p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>PPG IR/RED ABSORPTION</span>
                    <span className="text-[#00F5D4]">SNR: 48 dB</span>
                  </div>
                  <div className="h-7 w-full flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 200 30" preserveAspectRatio="none">
                      <path d="M 0 15 Q 25 0 50 15 T 100 15 T 150 15 T 200 15" fill="none" stroke="#00F5D4" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>MAX30102 • MLX90614</span>
                  <span className="text-[#00F5D4] font-bold">JITTER &lt; 0.4 MS</span>
                </div>
              </div>

              {/* Card 2: CSDI Neural Diffusion Imputation */}
              <div className="w-[82vw] sm:w-[420px] mermaid-glass p-5 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between shrink-0">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
                    MODULE // 02 • NEURAL DIFFUSION
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    CSDI Signal Imputation & Denoising
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Motion artifacts and perspiration lead to false emergency alarms. Our Conditional Diffusion model reconstructs lost telemetry with 98.55% fidelity.
                  </p>
                </div>

                {/* Micro Visual inside Card */}
                <div className="my-2.5 p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>RESTORED LOST PACKETS</span>
                    <span className="text-cyan-400">PASS 10</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 h-5 items-center">
                    {[1,1,1,0,1,1].map((ok, i) => (
                      <div key={i} className={`h-full rounded ${ok ? "bg-cyan-500/40" : "bg-rose-500/80 animate-pulse"} border border-white/10 flex items-center justify-center text-[7px] font-mono`}>
                        {ok ? "✓" : "IMP"}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>RECONSTRUCTION MAE</span>
                  <span className="text-cyan-400 font-bold">1.45% OPTIMAL</span>
                </div>
              </div>

              {/* Card 3: Autonomous PHC Emergency Dispatch */}
              <div className="w-[82vw] sm:w-[420px] mermaid-glass p-5 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between shrink-0">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-rose-400 uppercase">
                    MODULE // 03 • EMERGENCY GEOFENCE
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Sub-Second PHC Dispatch Network
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Automated geofencing immediately alerts the nearest Primary Health Centre (PHC) ambulance network when severe hypoxia or arrhythmia is detected.
                  </p>
                </div>

                {/* Micro Visual inside Card */}
                <div className="my-2.5 p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <Hospital className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">Indiranagar Urban PHC</span>
                  </div>
                  <span className="text-white font-bold">2.4 km • 6 min</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>LATENCY TO DISPATCH</span>
                  <span className="text-rose-400 font-bold">&lt; 800 MS</span>
                </div>
              </div>

              {/* Card 4: FHIR R4 Sovereign Biometric Vault */}
              <div className="w-[82vw] sm:w-[420px] mermaid-glass p-5 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between shrink-0">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-[#00F5D4] uppercase">
                    MODULE // 04 • SOVEREIGN SECURITY
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    FHIR R4 Sovereign Data Vault
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Zero-knowledge biometric storage with AES-GCM-256 cryptographic hardware isolation ensures sensitive telemetry remains entirely under your sovereign control.
                  </p>
                </div>

                {/* Micro Visual inside Card */}
                <div className="my-2.5 p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> AES-256 ENCRYPTED
                  </span>
                  <span>ZERO-KNOWLEDGE</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>STANDARDS</span>
                  <span className="text-[#00F5D4] font-bold">FHIR • HL7 • HIPAA</span>
                </div>
              </div>

            </motion.div>
          </div>

          {/* ── LIVE SCROLLYTELLING TELEMETRY DOCK (FILLS BOTTOM VIEWPORT) ── */}
          <div className="max-w-7xl mx-auto w-full pt-3 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">Sampling Rate</span>
                  <span className="text-xs font-black font-mono text-white">250 Hz Real-Time</span>
                </div>
                <Activity className="w-3.5 h-3.5 text-[#00F5D4]" />
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">Diffusion Inference</span>
                  <span className="text-xs font-black font-mono text-cyan-400">&lt; 8.2 ms Edge</span>
                </div>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">PHC Dispatch</span>
                  <span className="text-xs font-black font-mono text-rose-400">Sub-Second Ring</span>
                </div>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">Data Compliance</span>
                  <span className="text-xs font-black font-mono text-[#00F5D4]">FHIR R4 / HL7</span>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. INTERACTIVE SIGNAL DENOISING & WAVEFORM LABORATORY
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mermaid-glass p-8 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.25em] text-[#00F5D4] uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>03 // NEURAL RECONSTRUCTION ENGINE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Live Waveform Denoising Laboratory.
              </h2>
              <p className="text-sm text-[#94A3B8] max-w-xl">
                Compare raw motion-corrupted photoplethysmography against the CSDI neural diffusion output in real-time.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/15">
              <button
                onClick={() => setSignalMode("corrupted")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  signalMode === "corrupted"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Corrupted (Motion Noise)
              </button>
              <button
                onClick={() => setSignalMode("denoised")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  signalMode === "denoised"
                    ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                CSDI Denoised (98.5% Fidelity)
              </button>
            </div>
          </div>

          {/* Interactive Oscilloscope Display */}
          <div className="p-6 rounded-2xl bg-black/70 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-white">
                <span className={`w-2 h-2 rounded-full ${signalMode === "denoised" ? "bg-[#00F5D4]" : "bg-rose-500"} animate-pulse`} />
                MODE: {signalMode === "denoised" ? "CSDI_DIFFUSION_RECONSTRUCTED" : "RAW_ANALOG_MOTION_NOISE"}
              </span>
              <span className="text-[#94A3B8]">
                {signalMode === "denoised" ? "RECONSTRUCTION LOSS: 0.0145" : "MISSING PACKETS: 14.2%"}
              </span>
            </div>

            <div className="h-32 w-full bg-[#05080C] rounded-xl border border-white/10 overflow-hidden relative flex items-center">
              <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
                {signalMode === "denoised" ? (
                  <motion.path
                    d="M 0 60 Q 50 10 100 60 T 200 60 T 300 60 T 400 60 T 500 60 T 600 60 T 700 60 T 800 60"
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                ) : (
                  <motion.path
                    d="M 0 60 L 40 40 L 70 90 L 100 20 L 140 100 L 180 30 L 220 80 L 260 10 L 300 110 L 350 50 L 400 90 L 450 30 L 500 100 L 550 40 L 600 85 L 650 20 L 700 95 L 750 35 L 800 60"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                )}
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono text-[#94A3B8]">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="block text-[10px] uppercase font-bold text-white">Artifact Suppression</span>
                <p className="mt-0.5 text-[#00F5D4]">99.2% Motion Rejection</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="block text-[10px] uppercase font-bold text-white">False Alarm Reduction</span>
                <p className="mt-0.5 text-cyan-400">Zero False Emergency Calls</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="block text-[10px] uppercase font-bold text-white">Clinical Validation</span>
                <p className="mt-0.5 text-emerald-400">Hospital-Grade Conformity</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. FOUR-PILLAR CLINICAL ECOSYSTEM (BENTO GRID)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="space-y-4 mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[10px] text-[#00F5D4] uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>04 // FULL-STACK BIOMETRIC INFRASTRUCTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Built For Clinical Rigor.
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            An end-to-end medical architecture linking wearable physical hardware to local emergency response centres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bento Card 1 */}
          <div className="mermaid-glass p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between hover:border-[#00F5D4]/40 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Wearable IoMT Node
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                ESP32-S3 microcontroller with dual optical pulse sensors and skin-temperature thermopile, running 72 hours on a single 300mAh LiPo cell.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-[#00F5D4]">
              BLE 5.2 GATT • ULTRA-LOW POWER
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="mermaid-glass p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between hover:border-cyan-400/40 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Human Digital Twin
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Synchronized computational model mirroring organ stress (Heart, Lungs, Brain) with allostatic load scoring and autonomic balance indicators.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-cyan-400">
              AUC-ROC 0.994 PREDICTIVE SCORE
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="mermaid-glass p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Hospital className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                PHC Command Mesh
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Autonomous medical supply chain forecasting, cold-chain temperature telemetry, and epidemic surge early warning for district health centers.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-amber-400">
              DENGUE & FLU SURGE WARNING
            </div>
          </div>

          {/* Bento Card 4 */}
          <div className="mermaid-glass p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-400/40 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Clinical Health Passport
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Aggregates patient onboarding symptoms, pain mapping, and uploaded lab report biomarkers into a verified, cryptographically signed profile.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-emerald-400">
              ONE-CLICK LAB REPORT VAULT
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. METRIC PERFORMANCE COUNTERS (EDITORIAL GRID)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mermaid-glass p-8 sm:p-14 rounded-[3rem] border border-white/10 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
              99.4<span className="text-[#00F5D4]">%</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-[#94A3B8] uppercase">
              HDT Model Sync Fidelity
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
              &lt;12<span className="text-[#00F5D4]">ms</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-[#94A3B8] uppercase">
              BLE Telemetry Latency
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
              10<span className="text-[#00F5D4]">k+</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-[#94A3B8] uppercase">
              Connected IoMT Nodes
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
              0<span className="text-[#00F5D4]">%</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-[#94A3B8] uppercase">
              False Emergency Alarms
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. CLINICAL ARCHITECTURE FAQ ACCORDION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="font-mono text-xs tracking-[0.25em] text-[#00F5D4] uppercase">
            05 // FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Clinical Verification & Standards.
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does CSDI neural diffusion eliminate false emergency alarms?",
              a: "Standard wearable monitors trigger false positive alerts whenever a user walks, types, or perspires, because motion artifacts corrupt the optical PPG signal. HealthPulse AI utilizes Conditional Score-based Diffusion Models (CSDI) trained on millions of clinical ECG/PPG wave sequences to impute missing or motion-degraded packets, restoring true cardiac morphology before threshold triggers fire."
            },
            {
              q: "How does HealthPulse AI connect with Primary Health Centres (PHCs)?",
              a: "Our platform features an automated geofenced public health network. In the event of confirmed critical arrhythmias or acute hypoxia, the system calculates proximity to the nearest Primary Health Centre (PHC) and automatically notifies emergency response dispatchers with live GPS telemetry, user medical baseline, and vital trends."
            },
            {
              q: "Is patient biometric data private and HIPAA/FHIR R4 compliant?",
              a: "Yes. All personal telemetry is encrypted at rest using AES-GCM-256 and structured in accordance with HL7 FHIR R4 interoperability specifications. Health records and lab findings are strictly isolated to the user's sovereign account."
            },
            {
              q: "Can I view my complete medical history and uploaded lab reports?",
              a: "Yes. Visiting the Profile page grants full access to your personalized Health Passport, including every symptom, chronic condition, and pain map point logged during onboarding, as well as extracted biomarkers and PDF downloads of all diagnostic reports."
            }
          ].map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="mermaid-glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-[#00F5D4] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#00F5D4] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-t border-white/5 pt-3"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. FINAL CTA PORTAL
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="relative mermaid-glass p-12 sm:p-20 rounded-[3rem] text-center shadow-2xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,245,212,0.18)_0%,_transparent_75%)] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 mx-auto flex items-center justify-center text-[#00F5D4] shadow-lg shadow-[#00F5D4]/20">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Deploy Your Human Digital Twin.
            </h2>

            <p className="text-base text-[#94A3B8] font-light">
              Connect your telemetry devices, run an instant AI biometric assessment, and track your physiological resilience with clinical clarity.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="mermaid-btn h-14 px-10 rounded-2xl text-xs font-mono tracking-widest uppercase text-black font-extrabold shadow-xl shadow-[#00F5D4]/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  <span>CREATE FREE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-14 px-8 rounded-2xl text-xs font-mono tracking-widest uppercase border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              >
                <Link to="/login">SIGN IN TO EXISTING HUD</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#070A0D]/90 backdrop-blur-2xl py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#00F5D4]" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              HEALTHPULSE AI • SCROLLYTELLING MEDICAL ARCHITECTURE
            </span>
          </div>

          <div className="text-xs font-mono text-[#94A3B8]">
            © 2026 HealthPulse Intelligence Inc. All systems nominal.
          </div>

          <div className="flex items-center gap-6 text-xs font-mono tracking-wider">
            <Link to="/login" className="text-[#00F5D4] hover:underline">
              CLINICIAN PORTAL
            </Link>
            <Link to="/admin-login" className="text-[#94A3B8] hover:text-white">
              PHC ADMIN
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#070A0D]/95 backdrop-blur-2xl border-t border-white/10 z-40 md:hidden flex items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl">
        <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl font-mono text-xs uppercase border-white/15 bg-white/[0.04] text-white">
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild className="mermaid-btn flex-1 h-12 rounded-2xl font-mono text-xs uppercase font-extrabold text-black shadow-lg shadow-[#00F5D4]/25">
          <Link to="/signup">Access HUD →</Link>
        </Button>
      </div>

    </div>
  );
}
