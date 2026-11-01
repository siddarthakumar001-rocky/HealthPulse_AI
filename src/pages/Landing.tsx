import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  Brain,
  Heart,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Gauge,
  Cpu,
  Layers,
  Thermometer,
  Wind,
  Radio,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Moon,
  BatteryCharging
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    ecgSpeed: 2.2,
    ecgColor: "#05D3B3",
    twinAura: "rgba(5, 211, 179, 0.25)",
    aiInsight: "Autonomic nervous balance is optimal. Sinus rhythm shows 78ms HRV variability."
  },
  exercise: {
    label: "Cardio Demand",
    sub: "Sympathetic activation",
    bpm: 142,
    spo2: 96,
    temp: 37.4,
    stress: 64,
    status: "Elevated Metabolic Load",
    statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    ecgSpeed: 1.1,
    ecgColor: "#F59E0B",
    twinAura: "rgba(245, 158, 11, 0.35)",
    aiInsight: "Cardiac output 8.4 L/min. Coronary perfusion adequate. Oxygen debt compensating normally."
  },
  arrhythmia: {
    label: "Anomaly Detected",
    sub: "CSDI Denoising Active",
    bpm: 114,
    spo2: 93,
    temp: 36.9,
    stress: 86,
    status: "Telemetry Artifact Imputed",
    statusColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    ecgSpeed: 1.5,
    ecgColor: "#E11D48",
    twinAura: "rgba(225, 29, 72, 0.35)",
    aiInsight: "Premature ventricular contraction filtered. CSDI diffusion recovered 18 missing wave packets."
  },
  sleep: {
    label: "Deep Sleep Recovery",
    sub: "Parasympathetic regeneration",
    bpm: 54,
    spo2: 99,
    temp: 36.2,
    stress: 8,
    status: "Cellular Anabolism Active",
    statusColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    ecgSpeed: 3.2,
    ecgColor: "#06B6D4",
    twinAura: "rgba(6, 182, 212, 0.2)",
    aiInsight: "Delta brainwave synchronization. Growth hormone release and cardiovascular resting index optimal."
  }
};

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<SimulationMode>("resting");
  const [selectedOrgan, setSelectedOrgan] = useState<string>("heart");
  const current = PRESETS[mode];

  // Dynamic parallax transforms
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 400], [0, -40]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0.9]);

  return (
    <div className="relative min-h-screen w-full bg-[#F0F4F8] dark:bg-[#061215] text-[#0F172A] dark:text-slate-100 font-sans overflow-x-hidden selection:bg-teal-500/20">
      <LiquidCursor />
      
      {/* ── AMBIENT ANTIGRAVITY KINETIC BACKGROUND ── */}
      <AntiGravityBackground />

      {/* ── FLOATING ANTIGRAVITY ISLAND NAVIGATION ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="fixed top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto h-16 rounded-3xl mermaid-glass px-4 sm:px-6 flex items-center justify-between pointer-events-auto shadow-2xl">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-400/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5 animate-pulse text-[#05D3B3] drop-shadow-[0_0_10px_#05D3B3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground flex items-center gap-1">
                HealthPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3]">AI</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-muted-foreground">
                AntiGravity HUD v2.5
              </span>
            </div>
          </Link>

          {/* Quick HUD Connectivity Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/25 text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300">
            <span className="w-2 h-2 rounded-full bg-[#05D3B3] animate-ping" />
            <span>IoMT BLE Mesh Active • 250 Hz</span>
          </div>

          {/* Controls & Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            <Button
              variant="ghost"
              asChild
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hidden sm:inline-flex rounded-xl"
            >
              <Link to="/login">{t("landing.logIn", "Sign In")}</Link>
            </Button>

            <Button
              asChild
              className="mermaid-btn text-xs font-extrabold uppercase tracking-wider h-10 px-5 rounded-2xl shadow-lg shadow-teal-500/20"
            >
              <Link to="/signup">
                <span>{t("landing.getStarted", "Access HUD")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── MAIN ANTIGRAVITY SHOWCASE ── */}
      <main className="relative z-10 pt-28 sm:pt-36 pb-20 space-y-24 sm:space-y-32">
        
        {/* ════════════════════════════════════════════════════════════
            HERO COCKPIT: BENTO LAYOUT + 3D BIOMETRIC TWIN ENGINE
        ════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left 6 Columns: Executive Statement & Simulator Switcher */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-400/35 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#05D3B3] animate-spin" />
                <span>Hospital-Grade Telemetry • Digital Twin AI</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
                Autonomous <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-[#05D3B3] to-cyan-400 drop-shadow-[0_4px_25px_rgba(5,211,179,0.35)]">
                  Biometric Telemetry
                </span>{" "}
                in Real-Time Glass.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal max-w-xl">
                Experience the next paradigm of clinical monitoring. Continuous sensor fusion fuses optical PPG, CSDI neural reconstruction, and dynamic 3D human digital twin modeling to stop health crises before symptoms arrive.
              </p>

              {/* ── INTERACTIVE SIMULATION MODE SWITCHER ── */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" /> Live Telemetry Simulator:
                  </span>
                  <span className="text-teal-600 dark:text-teal-400">{current.label}</span>
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
                            ? "mermaid-glass border-teal-400 text-foreground shadow-lg shadow-teal-500/20 scale-[1.02]"
                            : "bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-white/10 text-muted-foreground hover:bg-white/60"
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{preset.label}</div>
                        <div className="text-[9px] font-mono opacity-70 truncate">{preset.bpm} BPM • {preset.spo2}%</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Button
                  size="lg"
                  asChild
                  className="mermaid-btn h-14 px-8 rounded-2xl text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40"
                >
                  <Link to="/signup" className="flex items-center gap-2">
                    <span>Initialize Scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="h-14 px-6 rounded-2xl text-xs font-extrabold uppercase tracking-wider border-teal-500/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white/80"
                >
                  Live Clinical Demo
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

            {/* Right 6 Columns: 3D Holographic Twin Cockpit */}
            <div className="lg:col-span-6 relative">
              
              {/* Outer Ambient Glow */}
              <div
                className="absolute inset-0 rounded-full blur-[100px] pointer-events-none transition-all duration-700"
                style={{ background: current.twinAura }}
              />

              {/* Holographic Shell Card */}
              <div className="relative mermaid-glass p-5 sm:p-7 rounded-[2.5rem] shadow-2xl border border-white/80 dark:border-white/15 overflow-hidden">
                
                {/* Header Strip inside Cockpit */}
                <div className="flex items-center justify-between border-b border-teal-500/20 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#05D3B3] animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-foreground">
                      HDT_MODEL: VIRTUAL_TWIN_3D
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    SYNC_RATE: 250Hz • ADC_16BIT
                  </div>
                </div>

                {/* Central Anatomical Display + Orbiting Telemetry Gauges */}
                <div className="relative h-[380px] sm:h-[440px] flex items-center justify-center">
                  
                  {/* Sweep Scanning Beam */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#05D3B3] to-transparent opacity-75 shadow-[0_0_15px_#05D3B3] z-20 pointer-events-none"
                    animate={{ top: ["5%", "95%", "5%"] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  />

                  {/* Anatomical Holographic Model SVG */}
                  <svg viewBox="0 0 240 400" className="w-full h-full max-h-[380px] drop-shadow-[0_0_25px_rgba(5,211,179,0.3)]">
                    {/* Head & Brain Cortex */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedOrgan("brain")}
                    >
                      <circle
                        cx="120"
                        cy="45"
                        r="25"
                        fill="rgba(5, 211, 179, 0.08)"
                        stroke={selectedOrgan === "brain" ? "#05D3B3" : "rgba(45, 212, 191, 0.4)"}
                        strokeWidth={selectedOrgan === "brain" ? "2.5" : "1.5"}
                      />
                      {/* Neural Pulses */}
                      <motion.circle
                        cx="120"
                        cy="45"
                        r="12"
                        fill="none"
                        stroke="#05D3B3"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      />
                    </g>

                    {/* Spine / Central Bus */}
                    <line x1="120" y1="70" x2="120" y2="240" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Torso & Ribcage */}
                    <path
                      d="M 85 80 Q 60 140 75 220 L 165 220 Q 180 140 155 80 Z"
                      fill="rgba(5, 211, 179, 0.04)"
                      stroke="rgba(45, 212, 191, 0.35)"
                      strokeWidth="1.5"
                    />

                    {/* Heart Organ - Bioluminescent Beating Anchor */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedOrgan("heart")}
                    >
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
                    </g>

                    {/* Lungs */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedOrgan("lungs")}
                    >
                      <motion.path
                        d="M 90 95 Q 75 130 90 160 Q 105 130 90 95 Z"
                        fill="rgba(6, 182, 212, 0.15)"
                        stroke={selectedOrgan === "lungs" ? "#06B6D4" : "rgba(6, 182, 212, 0.4)"}
                        strokeWidth="1.5"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M 150 95 Q 165 130 150 160 Q 135 130 150 95 Z"
                        fill="rgba(6, 182, 212, 0.15)"
                        stroke={selectedOrgan === "lungs" ? "#06B6D4" : "rgba(6, 182, 212, 0.4)"}
                        strokeWidth="1.5"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      />
                    </g>

                    {/* Arms & Legs Structure */}
                    <path
                      d="M 85 90 L 50 170 L 40 240 M 155 90 L 190 170 L 200 240 M 95 220 L 90 350 M 145 220 L 150 350"
                      stroke="rgba(45, 212, 191, 0.25)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>

                  {/* ── ORBITING TELEMETRY GLASS WIDGET 1: CARDIAC RATE ── */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    className="absolute top-2 left-0 sm:-left-3 mermaid-glass p-3 rounded-2xl shadow-xl w-36 sm:w-40 z-30"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      <span>Cardio Rate</span>
                      <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-foreground">{current.bpm}</span>
                      <span className="text-xs font-bold text-rose-500">BPM</span>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sinus Rhythm
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY GLASS WIDGET 2: SPO2 PULSE ── */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-2 right-0 sm:-right-3 mermaid-glass p-3 rounded-2xl shadow-xl w-36 sm:w-40 z-30"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      <span>SpO2 Blood Gas</span>
                      <Wind className="w-3.5 h-3.5 text-[#05D3B3]" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-foreground">{current.spo2}</span>
                      <span className="text-xs font-bold text-teal-500">%</span>
                    </div>
                    <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400 mt-1">
                      Perfusion PI: 4.8
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY GLASS WIDGET 3: TEMPERATURE ── */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-2 left-0 sm:-left-3 mermaid-glass p-3 rounded-2xl shadow-xl w-36 sm:w-40 z-30"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      <span>Body Temp</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-foreground">{current.temp}</span>
                      <span className="text-xs font-bold text-amber-500">°C</span>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-1">
                      Infrared MLX90614
                    </div>
                  </motion.div>

                  {/* ── ORBITING TELEMETRY GLASS WIDGET 4: STRESS / LOAD ── */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-2 right-0 sm:-right-3 mermaid-glass p-3 rounded-2xl shadow-xl w-36 sm:w-40 z-30"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      <span>Allostatic Load</span>
                      <Zap className="w-3.5 h-3.5 text-[#05D3B3]" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-foreground">{current.stress}</span>
                      <span className="text-xs font-bold text-muted-foreground">/100</span>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-1">
                      HRV: 78 ms
                    </div>
                  </motion.div>
                </div>

                {/* Live Real-time ECG Canvas Oscilloscope */}
                <div className="mt-4 pt-3 border-t border-teal-500/20">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                      <Activity className="w-3.5 h-3.5" /> REAL-TIME SINUS WAVEFORM (LEAD II)
                    </span>
                    <span className="text-teal-600 dark:text-teal-400">SPEED: {current.ecgSpeed}s/sweep</span>
                  </div>

                  <div className="h-14 w-full bg-slate-950/20 rounded-xl overflow-hidden relative border border-teal-500/15 flex items-center">
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
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2: THE ANTIGRAVITY BENTO ARCHITECTURE GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <div className="mermaid-chip text-xs uppercase tracking-widest font-mono">
              Clinical Core Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Engineered For Hospital-Grade Autonomy.
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Every layer of HealthPulse AI is optimized for zero false alarms, real-time wireless resilience, and immediate clinical triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: CSDI Diffusion Imputation (Large 2-Col Span) */}
            <div className="md:col-span-2 mermaid-glass p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-teal-400/50 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  CSDI Neural Diffusion Imputation
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  Motion artifacts, sensor slippage, and sweat drops normally cause false alarms in standard monitors. Our proprietary Conditional Score-based Diffusion model reconstructs lost telemetry wave packets with 98.55% fidelity.
                </p>
              </div>

              {/* Graphical Waveform Comparison Mini-HUD */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/30 border border-teal-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-teal-400 font-bold">● Raw Telemetry vs Imputed Signal</span>
                  <span className="text-muted-foreground">MAE: 1.45%</span>
                </div>
                <div className="h-10 w-full flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                    <path d="M 0 20 L 100 20 L 110 5 L 120 35 L 130 20 L 220 20" stroke="#05D3B3" strokeWidth="2" fill="none" />
                    <path d="M 220 20 L 270 20 L 280 8 L 290 32 L 300 20 L 400 20" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bento 2: Autonomous Emergency Dispatch */}
            <div className="mermaid-glass p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between group hover:border-teal-400/50 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Sub-Second PHC Dispatch
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Automated geofencing immediately alerts the nearest Primary Health Centre ambulance network when severe arrhythmias or hypoxia are confirmed.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-500/20 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-rose-500">SOS Trigger: &lt; 800ms</span>
                <span className="text-muted-foreground">Radius: 15 km</span>
              </div>
            </div>

            {/* Bento 3: Photoplethysmography Sensor Fusion */}
            <div className="mermaid-glass p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between group hover:border-teal-400/50 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Continuous Optical Fusion
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dual-wavelength red/infrared optical sensor fusion measures peripheral blood perfusion and vascular compliance non-invasively.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-500/20 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                MAX30102 • 16-bit Sigma-Delta ADC
              </div>
            </div>

            {/* Bento 4: Sovereign Biometric Data Vault (2-Col Span) */}
            <div className="md:col-span-2 mermaid-glass p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between group hover:border-teal-400/50 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  FHIR / HL7 Compliant Sovereign Encrypted Vault
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  Your biological data belongs exclusively to you. End-to-end AES-GCM-256 encryption protects every ECG datapoint, lab report, and clinician consultation with cryptographic integrity.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-muted-foreground">
                <span className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">HIPAA Compliant</span>
                <span className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">FHIR R4 Ready</span>
                <span className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">Zero-Knowledge Storage</span>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 3: METRIC COUNTER STRIP
        ════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mermaid-glass p-8 sm:p-12 rounded-[2.5rem] shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3]">
                99.4%
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Twin Model Sync
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3]">
                &lt;12ms
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                BLE Telemetry Latency
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3]">
                10k+
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Connected Nodes
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3]">
                0
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                False Emergency Alarms
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 4: FINAL CTA PORTAL
        ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative mermaid-glass p-10 sm:p-16 rounded-[3rem] text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(5,211,179,0.2)_0%,_transparent_75%)] pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/15 border border-teal-400/40 mx-auto flex items-center justify-center text-[#05D3B3] shadow-lg shadow-teal-500/25">
                <Zap className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                Deploy Your Human Digital Twin Today.
              </h2>

              <p className="text-base text-muted-foreground">
                Connect your telemetry devices, run an instant AI biometric assessment, and track your physiological resilience with clinical clarity.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  asChild
                  className="mermaid-btn h-14 px-10 rounded-2xl text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-teal-500/30 hover:scale-105 transition-all"
                >
                  <Link to="/signup" className="flex items-center gap-2">
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 px-8 rounded-2xl text-xs font-extrabold uppercase tracking-wider border-teal-500/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md"
                >
                  <Link to="/login">Sign In to Existing HUD</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-teal-500/20 bg-white/40 dark:bg-slate-950/60 backdrop-blur-2xl py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#05D3B3]" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              HealthPulse AI • AntiGravity Medical Glass Architecture
            </span>
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            © 2026 HealthPulse Intelligence Inc. All systems nominal.
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
              Clinician Portal
            </Link>
            <Link to="/admin-login" className="text-muted-foreground hover:text-foreground">
              PHC Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Thumb Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-[#061215]/90 backdrop-blur-2xl border-t border-teal-500/20 z-40 md:hidden flex items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl">
        <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-teal-500/30 bg-white/70 dark:bg-slate-900/70 text-foreground">
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild className="mermaid-btn flex-1 h-12 rounded-2xl font-bold text-white shadow-lg shadow-teal-500/25">
          <Link to="/signup">Access HUD →</Link>
        </Button>
      </div>

    </div>
  );
}
