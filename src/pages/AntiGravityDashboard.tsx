import React, { useState } from "react";
import { motion } from "framer-motion";
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

export default function AntiGravityDashboard() {
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<string>("voltage");
  const [simulatedDrop, setSimulatedDrop] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#F0F4F8] text-[#1E293B] font-sans overflow-x-hidden p-4 sm:p-6 md:p-12 select-none">
      {/* ── ANTI-GRAVITY BACKGROUND CANVAS: FLOATING PASTEL ORBS ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Blue Orb */}
        <motion.div
          className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full opacity-60 filter blur-[90px]"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, #BFDBFE 70%, transparent 100%)" }}
          animate={{
            x: [0, 60, -30, 0],
            y: [0, 80, 20, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pale Lavender Orb */}
        <motion.div
          className="absolute top-1/3 -right-24 w-[520px] h-[520px] rounded-full opacity-55 filter blur-[100px]"
          style={{ background: "radial-gradient(circle, #DDD6FE 0%, #E9D5FF 70%, transparent 100%)" }}
          animate={{
            x: [0, -70, 40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 0.92, 1.05, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Cloud Cyan Orb */}
        <motion.div
          className="absolute -bottom-28 left-1/3 w-[480px] h-[480px] rounded-full opacity-45 filter blur-[95px]"
          style={{ background: "radial-gradient(circle, #A5F3FC 0%, #CFFAFE 70%, transparent 100%)" }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.05, 0.96, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── FOREGROUND CONTENT HUD ── */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="w-9 h-9 rounded-2xl bg-white/70 border border-white flex items-center justify-center text-[#1E293B] hover:bg-white shadow-sm transition active:scale-95"
                title="Return to Standard Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2563EB] animate-pulse" />
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                  HEALTH<span className="text-[#2563EB]">PULSE</span> ANTIGRAVITY
                </h1>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider pl-12">
              IoMT Energy • Current • Voltage & Physiological Waveform Telemetry HUD
            </p>
          </div>

          {/* Quick System Status Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md"
              style={{
                boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.8), 4px 6px 14px rgba(148,163,184,0.18)",
              }}
            >
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-[#0F172A]">HDT In-Sync: 99.4%</span>
            </div>

            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md"
              style={{
                boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.8), 4px 6px 14px rgba(148,163,184,0.18)",
              }}
            >
              <Dumbbell className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0F172A]">Context: Resting (No False Alarms)</span>
            </div>
          </div>
        </header>

        {/* ── METRICS GRID: HYBRID GLASS-NEUMORPHIC CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </div>

        {/* ── MAIN TELEMETRY STAGE (THE WEIGHTLESS HUD) ── */}
        <motion.div
          className="rounded-3xl p-6 md:p-8 border border-white/80 bg-white/40 backdrop-blur-xl relative overflow-hidden"
          style={{
            boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.9), 10px 14px 28px rgba(148,163,184,0.22)",
          }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Continuous Waveform Stream & CSDI Reconstruction
                </h2>
              </div>
              <p className="text-xs text-[#64748B]">
                Dual-channel voltage-current telemetry fused with optical SpO2 and cardiac wave
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#0F172A]">
                <span className="w-3 h-1.5 rounded-full bg-[#2563EB]" /> Sensor Raw
              </span>
              <span className="flex items-center gap-1.5 text-[#0EA5E9]">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#0EA5E9]" /> CSDI Denoised
              </span>
              <span className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-3 h-0.5 border-t-2 border-dotted border-[#F59E0B]" /> TimeGrad Forecast
              </span>
            </div>
          </div>

          {/* Simulated Waveform SVG */}
          <div className="h-48 w-full relative flex items-center justify-center bg-white/20 rounded-2xl p-2 border border-white/40">
            <svg viewBox="0 0 800 160" preserveAspectRatio="none" className="w-full h-full">
              {/* Baseline Grid */}
              <line x1="0" y1="80" x2="800" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="40" x2="800" y2="40" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* Real Sensor Signal (Solid Blue) */}
              <motion.path
                d="M 0 80 L 100 80 L 120 38 L 135 122 L 150 74 L 165 86 L 180 80 L 320 80 L 340 34 L 355 126 L 370 70 L 385 86 L 400 80 L 450 80"
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
          <div className="mt-4 pt-4 border-t border-white/60 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#64748B]">
            <div className="flex flex-wrap items-center gap-4">
              <span>Sampling: <strong>250 Hz</strong></span>
              <span>Quantization: <strong>16-bit ADC</strong></span>
              <span>Reconstruction MAE: <strong className="text-[#2563EB]">1.45%</strong></span>
              <span>False Alarms Prevented: <strong className="text-[#10B981]">3 Events</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulatedDrop(!simulatedDrop)}
                className="h-8 text-xs bg-white/70 hover:bg-white text-[#0F172A] border-white shadow-sm"
              >
                {simulatedDrop ? "Reset Sensor Feed" : "Simulate Signal Drop"}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="h-8 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm gap-1"
              >
                <span>Full Digital Twin Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
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
      className={`relative cursor-pointer rounded-3xl p-6 border transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? "border-[#2563EB]/40 bg-white/55"
          : "border-white/80 bg-white/40 hover:bg-white/50"
      }`}
      style={{
        boxShadow: isSelected
          ? "inset 1px 1px 3px rgba(255,255,255,0.9), 0 0 20px rgba(37,99,235,0.15), 10px 14px 28px rgba(148,163,184,0.22)"
          : "inset 2px 2px 4px rgba(255,255,255,0.9), 8px 12px 24px rgba(148,163,184,0.18)",
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-white/80 border border-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#475569] border border-white/60">
          {badge}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">{value}</h3>
      </div>

      {/* Metric Delta & Status */}
      <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-bold text-[#10B981]">
          <TrendingUp className="w-3.5 h-3.5" />
          {change}
        </span>
        <span className="text-[#64748B] font-medium">{status}</span>
      </div>
    </motion.div>
  );
}
