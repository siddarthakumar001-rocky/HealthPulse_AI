import React, { useState, useRef } from "react";
import { motion, useScroll, useSpring, AnimatePresence, useMotionValueEvent } from "framer-motion";
import {
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ChamberData {
  id: number;
  key: string;
  tabLabel: string;
  shortTabLabel: string;
  featureTag: string;
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
  capabilities: string[];
  metrics: { label: string; value: string; unit: string }[];
  route: string;
  actionLabel: string;
}

// ── REUSABLE ANATOMICAL HEART SVG WITH 4 INTERACTIVE GLOWING CHAMBERS ──
function AnatomicalHeart({
  activeIdx,
  onSelectChamber,
  compact = false
}: {
  activeIdx: number;
  onSelectChamber: (idx: number) => void;
  compact?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 360 400"
      className="w-full h-full select-none"
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
          stroke={activeIdx === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"}
          strokeWidth={activeIdx === 3 ? (compact ? "11" : "14") : (compact ? "8" : "10")}
          strokeLinecap="round"
        />
        {/* Aortic Arch 3 Branches */}
        <line x1="215" y1="28" x2="215" y2="10" stroke={activeIdx === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="3" strokeLinecap="round" />
        <line x1="235" y1="30" x2="238" y2="10" stroke={activeIdx === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="3" strokeLinecap="round" />
        <line x1="252" y1="38" x2="260" y2="12" stroke={activeIdx === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.4)"} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── PULMONARY ARTERY (Branch to Lungs) ── */}
      <path
        d="M 195 125 C 190 75 140 60 100 70"
        fill="none"
        stroke={activeIdx === 1 ? "#38BDF8" : "rgba(56, 189, 248, 0.4)"}
        strokeWidth={activeIdx === 1 ? (compact ? "10" : "12") : (compact ? "7" : "8")}
        strokeLinecap="round"
      />

      {/* ── SUPERIOR VENA CAVA ── */}
      <path
        d="M 110 50 L 110 115"
        stroke={activeIdx === 0 ? "#00F5D4" : "rgba(0, 245, 212, 0.4)"}
        strokeWidth={compact ? "8" : "10"}
        strokeLinecap="round"
      />

      {/* ── CHAMBER 1: RIGHT ATRIUM (Upper Anatomical Right / Viewer Left) ── */}
      <g onClick={() => onSelectChamber(0)} className="cursor-pointer group">
        <motion.path
          d="M 105 120 C 70 125 60 170 85 200 C 115 210 135 190 145 160 C 150 135 130 118 105 120 Z"
          fill={activeIdx === 0 ? "rgba(0, 245, 212, 0.45)" : "rgba(0, 245, 212, 0.08)"}
          stroke={activeIdx === 0 ? "#00F5D4" : "rgba(0, 245, 212, 0.3)"}
          strokeWidth={activeIdx === 0 ? "3.5" : "1.5"}
          animate={activeIdx === 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
        {/* Sinoatrial (SA) Node Pulsing Pacemaker Rings */}
        <circle cx="108" cy="130" r={compact ? "5" : "6"} fill="#00F5D4" className="drop-shadow-[0_0_10px_#00F5D4]" />
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
        {!compact && (
          <text x="75" y="165" fill={activeIdx === 0 ? "#00F5D4" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
            RA • BLE SENSORS
          </text>
        )}
      </g>

      {/* ── CHAMBER 2: RIGHT VENTRICLE (Lower Anatomical Right / Viewer Left-Center) ── */}
      <g onClick={() => onSelectChamber(1)} className="cursor-pointer group">
        <motion.path
          d="M 95 210 C 80 250 120 310 160 340 C 175 300 175 240 160 210 C 140 205 110 205 95 210 Z"
          fill={activeIdx === 1 ? "rgba(56, 189, 248, 0.45)" : "rgba(56, 189, 248, 0.08)"}
          stroke={activeIdx === 1 ? "#38BDF8" : "rgba(56, 189, 248, 0.3)"}
          strokeWidth={activeIdx === 1 ? "3.5" : "1.5"}
          animate={activeIdx === 1 ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        />
        {!compact && (
          <text x="100" y="270" fill={activeIdx === 1 ? "#38BDF8" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
            RV • CSDI DIFFUSION
          </text>
        )}
      </g>

      {/* ── CHAMBER 3: LEFT ATRIUM (Upper Anatomical Left / Viewer Right) ── */}
      <g onClick={() => onSelectChamber(2)} className="cursor-pointer group">
        <motion.path
          d="M 220 125 C 260 125 285 160 265 195 C 240 205 215 195 205 165 C 200 140 210 125 220 125 Z"
          fill={activeIdx === 2 ? "rgba(244, 63, 94, 0.45)" : "rgba(244, 63, 94, 0.08)"}
          stroke={activeIdx === 2 ? "#F43F5E" : "rgba(244, 63, 94, 0.3)"}
          strokeWidth={activeIdx === 2 ? "3.5" : "1.5"}
          animate={activeIdx === 2 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }}
        />
        {!compact && (
          <text x="215" y="165" fill={activeIdx === 2 ? "#F43F5E" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
            LA • DIGITAL TWIN
          </text>
        )}
      </g>

      {/* ── CHAMBER 4: LEFT VENTRICLE (Lower Anatomical Left / Thickest Muscle Apex) ── */}
      <g onClick={() => onSelectChamber(3)} className="cursor-pointer group">
        <motion.path
          d="M 180 215 C 190 250 200 300 180 365 C 225 320 270 260 255 210 C 230 205 200 205 180 215 Z"
          fill={activeIdx === 3 ? "rgba(168, 85, 247, 0.5)" : "rgba(168, 85, 247, 0.08)"}
          stroke={activeIdx === 3 ? "#A855F7" : "rgba(168, 85, 247, 0.3)"}
          strokeWidth={activeIdx === 3 ? "4" : "1.5"}
          animate={activeIdx === 3 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.6 }}
        />
        {!compact && (
          <text x="185" y="280" fill={activeIdx === 3 ? "#A855F7" : "currentColor"} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">
            LV • PHC DISPATCH
          </text>
        )}
      </g>

      {/* ── ELECTRICAL CONDUCTION PATHWAYS (BUNDLE OF HIS & PURKINJE NETWORK) ── */}
      <g className="pointer-events-none">
        <line x1="108" y1="130" x2="165" y2="190" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="165" cy="190" r="3.5" fill="#FACC15" />
        <line x1="165" y1="190" x2="175" y2="280" stroke="#FACC15" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 175 280 L 130 320 M 175 280 L 220 330" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

// ── REUSABLE LEAD-II ECG WAVEFORM RIBBON ──
function ECGWaveform({
  currentChamber,
  compact = false
}: {
  currentChamber: ChamberData;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-800 dark:border-white/10 text-white ${compact ? 'p-1.5' : 'p-2 sm:p-2.5'}`}>
      <div className="flex items-center justify-between text-[9px] font-mono mb-0.5 sm:mb-1">
        <span className="flex items-center gap-1 font-bold text-[#00F5D4] truncate">
          <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00F5D4] shrink-0" />
          {currentChamber.electricalPhase}
        </span>
        <span className="text-slate-400 text-[8px] sm:text-[9px] shrink-0">LEAD-II ECG WAVE</span>
      </div>
      <div className={`${compact ? 'h-4 sm:h-5' : 'h-6 sm:h-7'} w-full flex items-center overflow-hidden`}>
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
  );
}

export default function CardiacChambersScrollytelling() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Touch gesture tracker for horizontal swipe on mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Scroll scrub tracking across the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Smoothly advance chamber index based on vertical scroll scrub
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(3, Math.max(0, Math.floor(latest * 4)));
    setActiveIdx(idx);
  });

  const chambers: ChamberData[] = [
    {
      id: 0,
      key: "chamber1",
      tabLabel: "01 BLE SENSORS",
      shortTabLabel: "01 BLE",
      featureTag: "APPLICATION FEATURE 01 // HARDWARE TELEMETRY",
      name: t("phc.feature1Name", "Real-Time IoMT Biometric Sensor Fusion"),
      role: t("phc.feature1Role", "250 Hz Continuous Multi-Parametric Vitals Acquisition & Pacemaker Sync"),
      anatomicalName: "Mapped to Chamber I: Right Atrium & Sinoatrial Node (Biological Pacemaker)",
      pressure: "2 – 6 mmHg",
      oxygen: "75% Deoxygenated",
      electricalPhase: "P-Wave • SA Node Depolarization",
      clinicalTier: "TIER 01: 250 Hz BLE SENSOR FUSION",
      accentColor: "#00F5D4",
      glowColor: "rgba(0, 245, 212, 0.45)",
      bgGlow: "from-[#00F5D4]/20 via-[#0D9488]/10 to-transparent",
      ecgSegment: "P",
      description: t(
        "phc.feature1Desc",
        "Seamlessly pairs with Bluetooth Low Energy (BLE) medical wearables, optical pulse oximeters, smart patches, and ECG monitors. Streams high-fidelity continuous heart rate, SpO2, HRV, and skin temperature at 250 Hz with 16-bit Sigma-Delta precision."
      ),
      clinicalImpact: "Captures microvascular pulse transit time and sympathetic nervous tone at microsecond resolution.",
      capabilities: [
        "250 Hz Real-Time BLE Stream",
        "Sub-Millisecond Jitter (<0.4 ms)",
        "AES-256 Medical Encryption",
        "Continuous HRV & Arrhythmia Detect"
      ],
      metrics: [
        { label: "PACEMAKER RATE", value: "72", unit: "BPM" },
        { label: "SAMPLING ADC", value: "16-BIT", unit: "250 Hz" },
        { label: "HRV VARIABILITY", value: "78", unit: "ms" }
      ],
      route: "/dashboard",
      actionLabel: "Launch Vitals Cockpit"
    },
    {
      id: 1,
      key: "chamber2",
      tabLabel: "02 NEURAL CSDI",
      shortTabLabel: "02 CSDI",
      featureTag: "APPLICATION FEATURE 02 // SIGNAL RECONSTRUCTION",
      name: t("phc.feature2Name", "CSDI Neural Diffusion & Denoising Engine"),
      role: t("phc.feature2Role", "Deep-Learning Telemetry Imputation & Motion Artifact Cleansing"),
      anatomicalName: "Mapped to Chamber II: Right Ventricle & Pulmonary Circuit (Oxygenation Transit)",
      pressure: "15 – 25 mmHg",
      oxygen: "75% → 98% In Transit",
      electricalPhase: "PR-Segment • AV Delay & Ventricular Influx",
      clinicalTier: "TIER 02: CSDI NEURAL DIFFUSION",
      accentColor: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.45)",
      bgGlow: "from-sky-500/20 via-cyan-600/10 to-transparent",
      ecgSegment: "PR",
      description: t(
        "phc.feature2Desc",
        "Eliminates movement artifacts, sweat-induced noise, and missing telemetry packets using conditional score-based diffusion models. Reconstructs missing biometric frames with 98.55% clinical fidelity before diagnostic evaluation."
      ),
      clinicalImpact: "Cleanses perspiration noise, sensor decoupling, and movement spikes before machine learning inference.",
      capabilities: [
        "98.55% Imputation Accuracy",
        "< 8.2 ms Neural Inference",
        "Automated Baseline Wander Removal",
        "FHIR R4 / HL7 Data Compliance"
      ],
      metrics: [
        { label: "PULMONARY FLOW", value: "5.2", unit: "L/min" },
        { label: "DIFFUSION PASSES", value: "10", unit: "Iter" },
        { label: "RECONSTRUCTION", value: "98.55", unit: "%" }
      ],
      route: "/dashboard",
      actionLabel: "Inspect Neural Denoising"
    },
    {
      id: 2,
      key: "chamber3",
      tabLabel: "03 DIGITAL TWIN",
      shortTabLabel: "03 TWIN",
      featureTag: "APPLICATION FEATURE 03 // PREDICTIVE DIGITAL TWIN",
      name: t("phc.feature3Name", "Autonomous Predictive Clinical Digital Twin"),
      role: t("phc.feature3Role", "Dynamic Biological Simulation & 48-Hour Decompensation Early Warning"),
      anatomicalName: "Mapped to Chamber III: Left Atrium & Oxygenated Reservoir (Systemic Buffer)",
      pressure: "6 – 12 mmHg",
      oxygen: "98% Fully Oxygenated",
      electricalPhase: "PR-Interval • Interatrial Conduction",
      clinicalTier: "TIER 03: AUTONOMOUS DIGITAL TWIN",
      accentColor: "#F43F5E",
      glowColor: "rgba(244, 63, 94, 0.45)",
      bgGlow: "from-rose-500/20 via-pink-600/10 to-transparent",
      ecgSegment: "PR",
      description: t(
        "phc.feature3Desc",
        "Synthesizes a living computational replica of the patient's cardiovascular, pulmonary, and metabolic state. Automatically parses uploaded blood tests, scans, and questionnaires via OCR to forecast acute decompensation 48 hours prior to onset."
      ),
      clinicalImpact: "Calculates stroke volume indices and warns 48 hours prior to acute decompensation events.",
      capabilities: [
        "48-Hour Early Warning Engine",
        "Multimodal OCR Lab Report Parsing",
        "Allostatic Stress Score (0-100)",
        "Personalized Drug Interaction Model"
      ],
      metrics: [
        { label: "OXYGEN SAT (SpO2)", value: "99", unit: "%" },
        { label: "ATRIAL PRESSURE", value: "8.4", unit: "mmHg" },
        { label: "DIGITAL TWIN FIT", value: "99.4", unit: "%" }
      ],
      route: "/profile",
      actionLabel: "View Digital Twin Passport"
    },
    {
      id: 3,
      key: "chamber4",
      tabLabel: "04 EMERGENCY & IOT",
      shortTabLabel: "04 IOT",
      featureTag: "APPLICATION FEATURE 04 // PUBLIC HEALTH & LOGISTICS",
      name: t("phc.feature4Name", "Smart Supply Chain & Autonomous Emergency Ring"),
      role: t("phc.feature4Role", "District Epidemic Outbreak AI & Sub-Second Emergency PHC Geofencing"),
      anatomicalName: "Mapped to Chamber IV: Left Ventricle & Systemic Aorta (High-Pressure Delivery)",
      pressure: "100 – 140 mmHg",
      oxygen: "99% Peak Arterial Surge",
      electricalPhase: "QRS Complex • Giant Systolic Contraction",
      clinicalTier: "TIER 04: AUTONOMOUS PHC DISPATCH",
      accentColor: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.5)",
      bgGlow: "from-purple-500/25 via-indigo-600/10 to-transparent",
      ecgSegment: "QRS",
      description: t(
        "phc.feature4Desc",
        "When life-threatening arrhythmias, severe hypoxia, or sudden stockouts occur, HealthPulse AI triggers the district primary health centre (PHC) ring, alerts ambulances, and dispatches automated inter-facility medicine transfers via IoT smart scales."
      ),
      clinicalImpact: "Sub-second emergency telemetry ring automatically alerts nearest district ICU and PHC ambulances.",
      capabilities: [
        "< 800 ms PHC Ambulance Dispatch",
        "IoT Smart Scale Automated Restock",
        "District Epidemic Outbreak AI",
        "LoRaWAN Cold-Chain Monitoring"
      ],
      metrics: [
        { label: "SYSTOLIC PRESSURE", value: "120", unit: "mmHg" },
        { label: "CARDIAC OUTPUT", value: "6.8", unit: "L/min" },
        { label: "DISPATCH LATENCY", value: "<800", unit: "ms" }
      ],
      route: "/emergency",
      actionLabel: "Open Emergency Command Hub"
    }
  ];

  const currentChamber = chambers[activeIdx];

  const handleSelectChamber = (idx: number, smoothScroll = true) => {
    setActiveIdx(idx);
    // Only perform window scroll sync on desktop viewports (>= 1024px)
    // On mobile touch viewports, avoid window.scrollTo fighting native scroll physics
    if (smoothScroll && containerRef.current && typeof window !== "undefined" && window.innerWidth >= 1024) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const containerTop = rect.top + scrollTop;
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScrollable > 0) {
        const targets = [0.12, 0.37, 0.62, 0.88];
        window.scrollTo({
          top: containerTop + targets[idx] * totalScrollable,
          behavior: "smooth"
        });
      }
    }
  };

  const handlePrev = () => handleSelectChamber((activeIdx - 1 + 4) % 4, false);
  const handleNext = () => handleSelectChamber((activeIdx + 1) % 4, false);

  // Touch swipe detection for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Trigger only on intentional horizontal swipe (>40px and dominant over vertical scroll)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] w-full transition-colors duration-300 touch-pan-y"
    >
      {/* ── STICKY VIEWPORT CONTAINER ── */}
      <div className="sticky top-20 z-20 min-h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] w-full overflow-y-auto lg:overflow-hidden flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-8 max-w-7xl mx-auto touch-pan-y">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-200/80 dark:border-white/10 pb-1.5 sm:pb-2 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-[#0D9488] dark:text-[#00F5D4] uppercase">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00F5D4]" />
              <span>02 // HEALTHPULSE AI PLATFORM ARCHITECTURE</span>
            </div>
            <h2 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              {t("phc.heartChambersTitle", "Four Foundational Pillars of Intelligent Healthcare")}
            </h2>
          </div>

          {/* Chamber Switcher Tabs & Quick Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-black/60 border border-slate-200 dark:border-white/10 font-mono text-xs shrink-0">
            <button
              onClick={handlePrev}
              title="Previous Feature"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1">
              {chambers.map((c, i) => {
                const isActive = activeIdx === i;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChamber(i, false)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-xs transition-all duration-300 ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-[#00F5D4] dark:text-slate-950 shadow-md scale-105"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">{c.shortTabLabel}</span>
                    <span className="hidden sm:inline">{c.tabLabel}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              title="Next Feature"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Scroll Progress Bar */}
        <div className="w-full h-1 bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden shrink-0 my-1">
          <motion.div
            style={{ scaleX }}
            className="h-full bg-gradient-to-r from-[#00F5D4] via-[#38BDF8] via-[#F43F5E] to-[#A855F7] origin-left"
          />
        </div>

        {/* ── MOBILE VIEW (< lg): COMPACT, FULLY VISIBLE & TOUCH-SWIPEABLE ── */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="lg:hidden flex flex-col gap-2 my-auto py-1"
        >
          {/* Compact Top Visual HUD: Heart + ECG Ribbon Side-by-Side in One Unified Glass Capsule */}
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-black/60 border border-slate-200/90 dark:border-white/15 shadow-lg backdrop-blur-xl flex items-center gap-3">
            {/* Mini Animated Anatomical Heart */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-[25px] opacity-40 pointer-events-none transition-all duration-700"
                style={{ background: currentChamber.glowColor }}
              />
              <AnatomicalHeart
                activeIdx={activeIdx}
                onSelectChamber={(i) => handleSelectChamber(i, false)}
                compact
              />
            </div>

            {/* Right side: Chamber badge + Clinical Tier + ECG wave */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28 py-0.5">
              <div>
                <div className="flex items-center justify-between gap-1 text-[9px] font-mono mb-1">
                  <span className="flex items-center gap-1 font-bold text-[#0D9488] dark:text-[#00F5D4] truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping shrink-0" />
                    PILLAR {currentChamber.id + 1} OF 4
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[8px] font-mono shrink-0">
                    {currentChamber.pressure}
                  </span>
                </div>
                <div
                  className="text-xs font-mono font-bold tracking-tight truncate"
                  style={{ color: currentChamber.accentColor }}
                >
                  {currentChamber.clinicalTier}
                </div>
              </div>

              <ECGWaveform currentChamber={currentChamber} compact />
            </div>
          </div>

          {/* Mobile Feature Card */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentChamber.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-[#0D131A]/95 border border-slate-200/90 dark:border-white/10 shadow-xl backdrop-blur-2xl space-y-2"
            >
              {/* Feature Title & Role */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentChamber.accentColor }}
                  />
                  <span
                    className="font-mono text-[9px] font-bold tracking-widest uppercase truncate"
                    style={{ color: currentChamber.accentColor }}
                  >
                    {currentChamber.featureTag}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {currentChamber.name}
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                  {currentChamber.role}
                </p>
              </div>

              {/* Capabilities Mini Chips */}
              <div className="flex flex-wrap gap-1">
                {currentChamber.capabilities.slice(0, 2).map((cap, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-medium bg-slate-100 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#0D9488] dark:text-[#00F5D4] shrink-0" />
                    {cap}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                {currentChamber.description}
              </p>

              {/* 3 Metrics Pills Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {currentChamber.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-slate-50/90 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 text-center"
                  >
                    <span className="block text-[8px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 truncate">
                      {m.label}
                    </span>
                    <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                      <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                        {m.value}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400">
                        {m.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action CTA & Impact Banner */}
              <div className="pt-0.5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0D9488] dark:text-[#00F5D4] shrink-0" />
                  <span className="truncate">{currentChamber.clinicalImpact}</span>
                </span>
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 bg-slate-900 text-white dark:bg-[#00F5D4] dark:text-slate-950 font-bold hover:opacity-90 rounded-xl text-[11px] h-7 px-3 shadow-sm"
                >
                  <Link to={currentChamber.route}>
                    {currentChamber.actionLabel}
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile Swipe Hint Dots */}
          <div className="flex items-center justify-center gap-2 pt-0.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              {chambers.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectChamber(i, false)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIdx === i
                      ? "w-5 bg-[#00F5D4]"
                      : "w-1.5 bg-slate-300 dark:bg-white/20"
                  }`}
                  aria-label={`Go to chamber ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-[8px] uppercase tracking-wider">Swipe or tap to switch</span>
          </div>
        </div>

        {/* ── DESKTOP VIEW (lg+): FULL SIDE-BY-SIDE SCROLLYTELLING STAGE ── */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-center my-auto py-1">
          
          {/* Left Column (5 Cols): Animated Glowing SVG Anatomical Heart with 4 Distinct Chambers */}
          <div className="col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Ambient Bioluminescent Chamber Aura */}
            <div
              className="absolute inset-0 rounded-full blur-[80px] opacity-35 pointer-events-none transition-all duration-700"
              style={{ background: currentChamber.glowColor }}
            />

            {/* Heart Glass Shield */}
            <div className="relative w-full max-w-[360px] p-4 xl:p-5 rounded-[2rem] bg-white/80 dark:bg-black/60 border border-slate-200/90 dark:border-white/15 shadow-2xl backdrop-blur-xl">
              
              {/* Badge above Heart */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 border-b border-slate-200/60 dark:border-white/10 pb-1.5">
                <span className="flex items-center gap-1 font-bold text-[#0D9488] dark:text-[#00F5D4]">
                  <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
                  ANATOMICAL_MAPPING // 4-CHAMBERS
                </span>
                <span className="text-slate-500 dark:text-slate-400">PILLAR {currentChamber.id + 1} OF 4</span>
              </div>

              {/* Anatomical SVG Heart */}
              <div className="relative h-[220px] xl:h-[250px] flex items-center justify-center">
                <AnatomicalHeart
                  activeIdx={activeIdx}
                  onSelectChamber={(i) => handleSelectChamber(i, false)}
                />
              </div>

              {/* Synchronized ECG Waveform Ribbon */}
              <div className="mt-2.5">
                <ECGWaveform currentChamber={currentChamber} />
              </div>

            </div>
          </div>

          {/* Right Column (7 Cols): Dynamic Chamber Clinical Intelligence Card */}
          <div className="col-span-7">
            
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentChamber.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="p-5 xl:p-6 rounded-[2rem] bg-white/90 dark:bg-[#0D131A]/95 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-3"
              >
                {/* Header Tag & Feature Tier */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-ping"
                      style={{ backgroundColor: currentChamber.accentColor }}
                    />
                    <span
                      className="font-mono text-xs font-bold tracking-widest uppercase"
                      style={{ color: currentChamber.accentColor }}
                    >
                      {currentChamber.featureTag}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 italic">
                    {currentChamber.anatomicalName}
                  </span>
                </div>

                {/* Editorial Feature Title & Subtitle */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentChamber.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {currentChamber.role}
                  </p>
                </div>

                {/* Core Capabilities Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentChamber.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#0D9488] dark:text-[#00F5D4]" />
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Feature In-Depth Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentChamber.description}
                </p>

                {/* Real-Time Platform Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {currentChamber.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-50/90 dark:bg-black/50 border border-slate-200/80 dark:border-white/10"
                    >
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                        {m.label}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
                          {m.value}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature CTA & Physiological Impact Footer */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0D9488] dark:text-[#00F5D4] shrink-0" />
                    <span className="font-medium text-[11px]">{currentChamber.clinicalImpact}</span>
                  </div>
                  
                  <Button
                    asChild
                    size="sm"
                    className="shrink-0 bg-slate-900 text-white dark:bg-[#00F5D4] dark:text-slate-950 font-bold hover:opacity-90 rounded-xl text-xs h-8 px-3.5 shadow-sm"
                  >
                    <Link to={currentChamber.route}>
                      {currentChamber.actionLabel}
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-slate-200/80 dark:border-white/10 pt-1.5 sm:pt-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00F5D4] shrink-0" />
            <span className="truncate">HEALTHPULSE AI // 4 PILLARS LIVE ARCHITECTURE</span>
          </span>
          <span className="font-bold text-[#0D9488] dark:text-[#00F5D4] shrink-0">
            PILLAR {currentChamber.id + 1} OF 4
          </span>
        </div>

      </div>
    </section>
  );
}
