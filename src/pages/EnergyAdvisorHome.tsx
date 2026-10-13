import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  ArrowRight,
  TrendingDown,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  ArrowUpRight,
  Gauge,
  Sliders,
  Power,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EnergyAdvisorHome() {
  const navigate = useNavigate();
  const [croMode, setCroMode] = useState<"roi" | "sensors" | "agent">("roi");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [isDecoupling, setIsDecoupling] = useState(false);
  const [decoupledSuccess, setDecoupledSuccess] = useState(false);

  // Content mapped to CRO Mode
  const croContent = {
    roi: {
      headline: "Stop paying for machines that are running on empty.",
      subheadline:
        "Industrial motors, chillers, and compressors consume up to 34% of power in phantom idle state. GenAI Energy Advisor tracks high-frequency telemetry, attributes non-productive baselines, and recovers operational margins.",
      targetAudience: "Tailored for Plant Directors, CFOs & Operations Leaders",
      kpi1: "28.4%",
      kpi1Label: "Verified kWh Savings",
      kpi2: "0.0%",
      kpi2Label: "False Alert Rate (3-Signal Gate)",
      kpi3: "< 14 Days",
      kpi3Label: "Capital Payback Window",
    },
    sensors: {
      headline: "Sub-second 3-phase synchronization with zero latency.",
      subheadline:
        "Synthesizing high-speed current transformers (CTs), vibration accelerometers, and infrared thermal telemetry. Physics-informed ML differentiates mechanical friction from normal load fluctuations.",
      targetAudience: "Engineered for Electrical Reliability & Maintenance Teams",
      kpi1: "250 Hz",
      kpi1Label: "Multi-Channel Sampling",
      kpi2: "99.8%",
      kpi2Label: "Waveform Reconstruction (CSDI)",
      kpi3: "1.1% THD",
      kpi3Label: "Total Harmonic Distortion",
    },
    agent: {
      headline: "Closed-loop autonomous curtailment with human-in-the-loop safety.",
      subheadline:
        "Autonomous GenAI agents continuously evaluate operational work orders. The system automatically isolates unloaded motors and shifts thermal reservoir loads away from peak tariff windows.",
      targetAudience: "Autonomous Energy Microgrids & Smart Manufacturing",
      kpi1: "4 Motors",
      kpi1Label: "Auto-Decoupled Today",
      kpi2: "$1,420/mo",
      kpi2Label: "Peak Demand Charge Averted",
      kpi3: "ISO 50001",
      kpi3Label: "Energy Management Compliant",
    },
  };

  const currentCopy = croContent[croMode];

  const handleDecouple = () => {
    setIsDecoupling(true);
    setTimeout(() => {
      setIsDecoupling(false);
      setDecoupledSuccess(true);
      setTimeout(() => setDecoupledSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 overflow-x-hidden">
      {/* ── TOP AMBIENT GLOW EFFECT ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-sky-500/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── 1. STICKY FROSTED GLASS TOPBAR ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#070b14]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.35)]">
              <div className="w-full h-full bg-[#070b14] rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">ENERGY ADVISOR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">
                  ANTI-GRAVITY // TELEMETRY
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">Industrial Feeder & GenAI Curtailment Engine</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-mono font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Operations HUD
            </Link>
            <Link
              to="/antigravity"
              className="text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 transition hidden sm:inline-block"
            >
              Light Soft UI Mode
            </Link>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="glassoneu-btn-primary h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-xl font-mono gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>Facility Access</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── MAIN HERO WRAPPER ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-16">
        
        {/* ── 2. CRO MESSAGE MODE SWITCHER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl glassoneu-sunken border border-white/5">
          <div className="flex items-center gap-2 pl-3 text-xs font-mono text-slate-400">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">SELECT PERSPECTIVE:</span>
          </div>
          <div className="grid grid-cols-3 w-full sm:w-auto gap-1">
            <button
              onClick={() => setCroMode("roi")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                croMode === "roi"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>01.</span>
              <span className="hidden md:inline">Direct</span> ROI & Margins
            </button>
            <button
              onClick={() => setCroMode("sensors")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                croMode === "sensors"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>02.</span>
              <span className="hidden md:inline">Multi-Signal</span> Sensor Rigor
            </button>
            <button
              onClick={() => setCroMode("agent")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                croMode === "agent"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>03.</span>
              <span className="hidden md:inline">Autonomous</span> Agent Gate
            </button>
          </div>
        </div>

        {/* ── 3. HERO SECTION (EDITORIAL LEFT + 3-PHASE FEEDER RIGHT) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Editorial & Conversion Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>{currentCopy.targetAudience}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={croMode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  {currentCopy.headline}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                  {currentCopy.subheadline}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="glassoneu-btn-primary h-12 px-6 rounded-xl font-mono text-xs uppercase tracking-wider font-bold shadow-lg shadow-cyan-500/25 gap-2"
              >
                <span>Audit Your Facility Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("telemetry-matrix");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="glassoneu-btn h-12 px-6 rounded-xl font-mono text-xs uppercase tracking-wider text-slate-200 border-white/10 hover:border-cyan-500/40"
              >
                <span>Explore Telemetry Matrix</span>
              </Button>
            </div>

            {/* Micro-Metric KPI Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl glassoneu-sunken">
                <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400">{currentCopy.kpi1}</span>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{currentCopy.kpi1Label}</p>
              </div>
              <div className="p-3 rounded-xl glassoneu-sunken">
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">{currentCopy.kpi2}</span>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{currentCopy.kpi2Label}</p>
              </div>
              <div className="p-3 rounded-xl glassoneu-sunken">
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">{currentCopy.kpi3}</span>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{currentCopy.kpi3Label}</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3-Phase Live Feeder Telemetry Widget */}
          <div className="lg:col-span-5">
            <div className="glassoneu-card p-6 space-y-5 relative">
              {/* Widget Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Feeder MCC-04 // Live 3-Phase
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  Sub-Cycle Synced
                </Badge>
              </div>

              {/* 3-Phase Voltage / Current Dials */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg glassoneu-sunken space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Phase L1</span>
                  <div className="font-mono text-base font-bold text-cyan-300">230.4 V</div>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">48.2 A</div>
                </div>
                <div className="p-2.5 rounded-lg glassoneu-sunken space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Phase L2</span>
                  <div className="font-mono text-base font-bold text-cyan-300">229.8 V</div>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">46.8 A</div>
                </div>
                <div className="p-2.5 rounded-lg glassoneu-sunken space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Phase L3</span>
                  <div className="font-mono text-base font-bold text-cyan-300">231.1 V</div>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">47.9 A</div>
                </div>
              </div>

              {/* Oscilloscope Waveform Display */}
              <div className="p-3.5 rounded-xl glassoneu-sunken space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Activity className="w-3.5 h-3.5" /> High-Harmonic Oscilloscope
                  </span>
                  <span>THD: 1.1% (Safe)</span>
                </div>
                <div className="h-24 w-full relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="0" y1="45" x2="400" y2="45" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
                    <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
                    <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />

                    {/* Voltage Sine Wave (Electric Cyan) */}
                    <motion.path
                      d="M 0 45 Q 50 5, 100 45 T 200 45 T 300 45 T 400 45"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      initial={{ pathOffset: 0 }}
                      animate={{ pathOffset: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Current Sine Wave (Emerald Green) */}
                    <motion.path
                      d="M 0 45 Q 50 15, 100 45 T 200 45 T 300 45 T 400 45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      initial={{ pathOffset: 0 }}
                      animate={{ pathOffset: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                </div>
              </div>

              {/* Phantom Standby Intercept Alert */}
              <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/10 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Phantom Standby Intercept</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    4 Idle Motors
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Feeder MCC-04 unallocated load detected at 3.4 kW baseline without production throughput.
                </p>

                {decoupledSuccess ? (
                  <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Motors Decoupled! Baseline dropped by 3.4 kW.</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleDecouple}
                    disabled={isDecoupling}
                    className="w-full h-8 text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                  >
                    {isDecoupling ? "Executing Isolation Work Order..." : "Automate Curtailment Shutdown"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. EMBEDDED ANTIGRAVITY ENERGY DASHBOARD ── */}
        <section id="telemetry-matrix" className="space-y-6 pt-10 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Plant-Wide Load Curve & Device Attribution
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Real-time active power draw (kW) correlated with multi-modal anomaly diagnostics
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl glassoneu-sunken text-xs font-mono">
              {["all", "compressors", "chillers", "conveyors"].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setActiveGroup(grp)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                    activeGroup === grp
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Load Curve Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-8 glassoneu-card p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                  Primary Feeder Load: <strong className="text-white">124.6 kW</strong>
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingDown className="w-3.5 h-3.5" /> -18.2% vs Yesterday
                </span>
              </div>

              {/* Load Curve SVG Chart */}
              <div className="h-56 w-full relative flex items-center justify-center p-2">
                <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* Gradient Area */}
                  <path
                    d="M 0 130 Q 80 120, 150 70 T 300 110 T 450 60 T 600 85 L 600 180 L 0 180 Z"
                    fill="url(#loadFill)"
                  />
                  
                  {/* Load Curve Path */}
                  <path
                    d="M 0 130 Q 80 120, 150 70 T 300 110 T 450 60 T 600 85"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                  />
                  
                  {/* Optimal Reference Target Baseline (Emerald Dotted) */}
                  <path
                    d="M 0 145 L 600 145"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                <span>Shift Start: 06:00 AM</span>
                <span className="text-emerald-400">Target Baseline: 85.0 kW</span>
                <span>Peak Ceiling: 160.0 kW</span>
              </div>
            </div>

            {/* Cause Attribution & Live Diagnostics */}
            <div className="lg:col-span-4 glassoneu-card p-6 space-y-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Root Cause Attribution Engine
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl glassoneu-sunken space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">Compressor #2 Stage B</span>
                    <span className="text-amber-400 font-bold">Unloaded (74%)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sustained idle run time detected for 42 minutes with zero downstream pressure drop.
                  </p>
                </div>

                <div className="p-3 rounded-xl glassoneu-sunken space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">Thermal Chiller Loop 1</span>
                    <span className="text-emerald-400 font-bold">Optimal COP (4.2)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Variable frequency drive automatically modulated during ambient cool down.
                  </p>
                </div>

                <div className="p-3 rounded-xl glassoneu-sunken space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">Main Conveyor Drive</span>
                    <span className="text-cyan-400 font-bold">Synchronized</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Vibration spectrum nominal; bearing mechanical friction index within 0.04g.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="w-full glassoneu-btn h-9 text-xs font-mono font-bold uppercase text-slate-200 hover:text-white"
              >
                Inspect Full Sensor Log
              </Button>
            </div>
          </div>
        </section>

        {/* ── 5. TECHNICAL FOOTER & RESEARCH LINKS ── */}
        <footer className="pt-12 border-t border-white/5 text-slate-500 font-mono text-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-bold">GenAI Energy Advisor</span>
              <span>// Powered by Anti-Gravity Architecture</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link to="/antigravity" className="hover:text-cyan-400 transition">Soft UI HUD</Link>
              <Link to="/dashboard" className="hover:text-cyan-400 transition">Telemetry Console</Link>
              <Link to="/" className="hover:text-cyan-400 transition">HealthPulse AI Home</Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Compliant with industrial energy telemetry standards • Dual CSDI Score-Based Diffusion Imputation • Automated Work-Order Safety Gates
          </p>
        </footer>
      </main>
    </div>
  );
}
