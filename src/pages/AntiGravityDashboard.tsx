import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Zap,
  BatteryCharging,
  Gauge,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  Heart,
  Thermometer,
  Wind,
  Layers,
  ArrowLeft,
  Sparkles,
  Radio,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

export default function AntiGravityDashboard() {
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<string>("voltage");
  const [simulatedDrop, setSimulatedDrop] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#F0F4F8] dark:bg-[#0B1120] text-[#1E293B] dark:text-slate-100 font-sans overflow-x-hidden p-3 sm:p-6 md:p-12 select-none pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      {/* ── ANTI-GRAVITY PARALLAX BACKGROUND CANVAS ── */}
      <AntiGravityBackground />

      {/* ── FOREGROUND CONTENT HUD ── */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 flex items-center justify-center text-foreground hover:bg-white shadow-sm transition active:scale-95"
                title="Return to Standard Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-foreground/80" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2563EB] animate-pulse" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  HEALTH<span className="text-[#2563EB]">PULSE</span> ANTIGRAVITY
                </h1>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider pl-12">
              IoMT Energy • Physiological Waveform & Digital Twin Telemetry
            </p>
          </div>

          {/* Quick System Status Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-[#0F172A] dark:text-slate-100">HDT In-Sync: 99.4%</span>
            </div>

            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm"
            >
              <Dumbbell className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0F172A] dark:text-slate-100">Context: Resting</span>
            </div>
          </div>
        </motion.header>

        {/* ── METRICS GRID / HORIZONTAL SNAP CAROUSEL ON MOBILE ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* Card 1: Cardiac Waveform Potential */}
          <GlassNeumorphCard
            title="Cardiac Rate (ECG)"
            value="74 BPM"
            change="+1.2% normal"
            status="Sinus Rhythm Optimal"
            icon={<Heart className="w-5 h-5 text-[#E11D48]" />}
            badge="MAX30102 Optical"
            isSelected={activeMetric === "heart"}
            onClick={() => setActiveMetric("heart")}
          />

          {/* Card 2: Biometric Voltage Potential */}
          <GlassNeumorphCard
            title="Biometric Potential"
            value="3.28 V"
            change="+0.04 V stab"
            status="Nominal Calibration"
            icon={<Zap className="w-5 h-5 text-[#2563EB]" />}
            badge="ESP32 3V3 Rail"
            isSelected={activeMetric === "voltage"}
            onClick={() => setActiveMetric("voltage")}
          />

          {/* Card 3: Operating Telemetry Current */}
          <GlassNeumorphCard
            title="Telemetry Current"
            value="42.6 mA"
            change="-2.1 mA low"
            status="BLE Broadcast Active"
            icon={<Gauge className="w-5 h-5 text-[#0EA5E9]" />}
            badge="Continuous Mesh"
            isSelected={activeMetric === "current"}
            onClick={() => setActiveMetric("current")}
          />

          {/* Card 4: Energy Capacity */}
          <GlassNeumorphCard
            title="Wearable Battery"
            value="94.2 %"
            change="18.4 hrs left"
            status="Lithium Ion Polymer"
            icon={<BatteryCharging className="w-5 h-5 text-[#10B981]" />}
            badge="Optimal Reserve"
            isSelected={activeMetric === "energy"}
            onClick={() => setActiveMetric("energy")}
          />
        </motion.div>

        {/* ── MAIN TELEMETRY STAGE (THE WEIGHTLESS HUD) ── */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="rounded-3xl p-4 sm:p-6 md:p-8 border border-white/80 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden shadow-lg"
          whileHover={{ y: -3 }}
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                  Continuous Waveform Stream & CSDI Reconstruction
                </h2>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Dual-channel voltage-current telemetry fused with optical SpO2 and cardiac wave
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#0F172A] dark:text-slate-200">
                <span className="w-3 h-1.5 rounded-full bg-[#2563EB]" /> Sensor Raw
              </span>
              <span className="flex items-center gap-1.5 text-[#0EA5E9]">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#0EA5E9]" /> CSDI Denoised
              </span>
              <span className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" /> Live
              </span>
            </div>
          </div>

          {/* SVG Waveform Visualizer */}
          <div className="relative h-44 sm:h-52 w-full bg-[#0F172A]/5 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
              {/* Reference Grid */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-slate-300/30 dark:text-slate-700/30" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="800" height="160" fill="url(#grid)" />

              {/* Raw Cardiac Wave */}
              <motion.path
                d="M 0 80 L 100 80 L 120 40 L 135 120 L 150 70 L 165 85 L 180 80 L 300 80 L 320 38 L 335 122 L 350 72 L 365 86 L 380 80 L 450 80"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />

              {/* CSDI Imputed Reconstruction Gap (Dashed Cyan) */}
              <motion.path
                d="M 450 80 L 520 80 L 540 44 L 555 116 L 570 74 L 585 86 L 600 80"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              />

              {/* Restored Sensor Signal */}
              <motion.path
                d="M 600 80 L 700 80 L 720 36 L 735 124 L 750 72 L 765 86 L 780 80 L 800 80"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* Footer Stats Bar */}
          <div className="mt-4 pt-4 border-t border-white/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#64748B] dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span>Sampling: <strong className="text-foreground">250 Hz</strong></span>
              <span>Quantization: <strong className="text-foreground">16-bit ADC</strong></span>
              <span>Reconstruction MAE: <strong className="text-[#2563EB]">1.45%</strong></span>
              <span>False Alarms Prevented: <strong className="text-[#10B981]">3 Events</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulatedDrop(!simulatedDrop)}
                className="h-9 rounded-xl text-xs bg-white/70 dark:bg-slate-800/70 hover:bg-white text-foreground border-border shadow-sm"
              >
                {simulatedDrop ? "Reset Sensor Feed" : "Simulate Signal Drop"}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="h-9 rounded-xl text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm gap-1"
              >
                <span>Full Digital Twin Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}

/* ── REUSABLE DUAL-NEUMORPHIC GLASS CARD ── */
interface CardProps {
  title: string;
  value: string;
  change: string;
  status: string;
  icon: React.ReactNode;
  badge: string;
  isSelected?: boolean;
  onClick: () => void;
}

function GlassNeumorphCard({
  title,
  value,
  change,
  status,
  icon,
  badge,
  isSelected,
  onClick,
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer rounded-3xl p-5 sm:p-6 border transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? "border-[#2563EB]/40 bg-white/60 dark:bg-slate-800/60"
          : "border-white/80 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 hover:bg-white/50"
      }`}
      style={{
        boxShadow: isSelected
          ? "inset 1px 1px 3px rgba(255,255,255,0.9), 0 0 20px rgba(37,99,235,0.15), 10px 14px 28px rgba(148,163,184,0.22)"
          : "inset 2px 2px 4px rgba(255,255,255,0.9), 8px 12px 24px rgba(148,163,184,0.18)",
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-800 border border-white dark:border-white/10 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-white/60 dark:border-white/10">
          {badge}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">{value}</h3>
      </div>

      {/* Metric Delta & Status */}
      <div className="mt-4 pt-3 border-t border-white/60 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-bold text-[#10B981]">
          <TrendingUp className="w-3.5 h-3.5" />
          {change}
        </span>
        <span className="text-[#64748B] dark:text-slate-400 font-medium">{status}</span>
      </div>
    </motion.div>
  );
}
