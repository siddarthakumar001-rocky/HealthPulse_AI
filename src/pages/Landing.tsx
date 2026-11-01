import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Activity, Brain, Bell, Heart, ShieldAlert, Zap, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "../components/ThemeToggle";
import LiquidCursor from "@/components/LiquidCursor";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

// --- Custom Magnetic Button Wrapper ---
const MagneticButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function Landing() {
  const { t } = useTranslation();
  const [isBooting, setIsBooting] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeOrgan, setActiveOrgan] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    // Simulate system boot
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, isMobile ? 300 : 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax calculations based on mouse position
  const xParallax = (mousePos.x - window.innerWidth / 2) * -0.02;
  const yParallax = (mousePos.y - window.innerHeight / 2) * -0.02;

  // --- Boot Sequence Component ---
  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#041d20] text-teal-300 font-mono overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          <Activity className="h-16 w-16 mb-4 animate-pulse text-[#05D3B3] drop-shadow-[0_0_24px_rgba(5,211,179,0.85)]" />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_12px_rgba(5,211,179,0.5)]">
            Initializing AI Health System
          </h1>
          <div className="mt-8 h-1.5 w-64 bg-teal-950/80 rounded-full overflow-hidden relative border border-teal-500/30">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-teal-400 via-[#05D3B3] to-cyan-400 shadow-[0_0_15px_rgba(5,211,179,0.9)]"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="mt-4 text-xs text-teal-300/70"
          >
            Establishing neural telemetry link...
          </motion.p>
        </motion.div>
        {/* Scanning Line overlay */}
        <motion.div
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#05D3B3]/15 to-transparent pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-teal-500/20 font-sans md:cursor-none pb-24 md:pb-0">
      <LiquidCursor />
      <AntiGravityBackground />

      {/* --- Animated Futuristic Background Grid & Particles --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Soft Radial Ambient Aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-background to-background" />
        
        {/* Cyan/Seafoam Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(45, 212, 191, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.25) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            transform: 'perspective(600px) rotateX(60deg) translateY(-100px) translateZ(-180px)',
            transformOrigin: 'top center',
          }}
        />

        {/* Floating Bioluminescent Particles */}
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#05D3B3] rounded-full shadow-[0_0_10px_rgba(5,211,179,0.8)]"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              opacity: Math.random() * 0.6 + 0.2,
            }}
            animate={{
              y: [null, Math.random() * -220 - 120],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* --- Frosted Mermaid Glass Navigation --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="fixed top-0 w-full z-50 border-b border-teal-500/20 bg-background/70 backdrop-blur-2xl shadow-sm pt-[env(safe-area-inset-top)]"
      >
        <div className="container mx-auto px-2.5 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-500/15 border border-teal-400/35 group-hover:bg-teal-500/25 transition-all shadow-[0_0_16px_rgba(20,184,166,0.3)] shrink-0">
              <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-300 drop-shadow-[0_0_10px_rgba(5,211,179,0.8)] animate-pulse" />
            </div>
            <span className="font-display text-sm sm:text-2xl font-black tracking-wider text-foreground">
              HealthPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <MagneticButton className="hidden sm:inline-block">
              <Button variant="ghost" asChild className="text-foreground hover:text-teal-500 hover:bg-teal-500/10 font-bold uppercase tracking-widest text-xs rounded-xl">
                <Link to="/login">{t("landing.logIn", "Login")}</Link>
              </Button>
            </MagneticButton>
            <MagneticButton className="hidden sm:inline-block">
              <Button asChild className="mermaid-btn text-[10px] sm:text-xs h-9 sm:h-10 px-4 sm:px-6 rounded-full uppercase tracking-widest shadow-[0_4px_20px_rgba(13,148,136,0.35)]">
                <Link to="/signup">
                  <span>{t("landing.getStarted", "Access")}</span>
                </Link>
              </Button>
            </MagneticButton>
          </div>
        </div>
      </motion.nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 pt-32 pb-20">
        
        {/* --- Hero Section --- */}
        <section className="container mx-auto px-4 min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left: Headline & CTA */}
          <motion.div 
            className="flex-1 space-y-8"
            style={{ x: xParallax, y: yParallax }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mermaid-chip px-4 py-2 border-teal-400/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#05D3B3] animate-pulse shadow-[0_0_8px_#05D3B3]" />
              <span>System Online v2.4 • Digital Twin AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black font-display leading-tight tracking-tighter">
              <motion.span 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="block text-foreground"
              >
                Intelligent Health
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 drop-shadow-[0_2px_24px_rgba(5,211,179,0.4)]"
              >
                Monitoring System
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed font-light"
            >
              Merge human biology with artificial intelligence. Connect your telemetry devices for real-time tracking, Human Digital Twin modeling, and predictive health alerts without false alarms.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Button size="lg" asChild className="mermaid-btn w-full sm:w-auto h-14 px-8 rounded-full text-white font-extrabold uppercase tracking-widest text-sm shadow-[0_8px_30px_rgba(13,148,136,0.45)] hover:shadow-[0_12px_36px_rgba(5,211,179,0.6)]">
                  <Link to="/signup" className="flex items-center justify-center">
                    Initialize Scan <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </MagneticButton>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-teal-500/30 bg-teal-500/10 shadow-sm flex items-center justify-center text-xs backdrop-blur-md">
                      <Activity className="h-4 w-4 text-[#05D3B3]" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-foreground">10k+ Nodes</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active globally</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Live AI Preview & Holographic Human Body */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="flex-1 relative w-full max-w-sm md:max-w-lg mx-auto lg:mx-0 mt-8 lg:mt-0"
            style={{ x: xParallax * -1, y: yParallax * -1 }}
          >
            <div className="relative aspect-[3/4] md:aspect-square">
              {/* Glowing Background Oceanic Sphere */}
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />

              {/* Human Body Interactive Holographic SVG */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] drop-shadow-[0_0_20px_rgba(5,211,179,0.35)]">
                  {/* Head/Brain */}
                  <motion.path
                    d="M100 20 C120 20, 120 60, 100 70 C80 60, 80 20, 100 20 Z"
                    fill="transparent"
                    stroke={activeOrgan === 'brain' ? '#05D3B3' : 'rgba(45, 212, 191, 0.55)'}
                    strokeWidth="2.5"
                    onMouseEnter={() => setActiveOrgan('brain')}
                    onMouseLeave={() => setActiveOrgan(null)}
                    className="cursor-pointer transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
                  {/* Chest/Heart Area */}
                  <motion.path
                    d="M80 80 C60 80, 50 120, 70 180 C100 200, 100 200, 130 180 C150 120, 140 80, 120 80 C110 80, 100 100, 100 100 C100 100, 90 80, 80 80 Z"
                    fill="transparent"
                    stroke={activeOrgan === 'heart' ? '#05D3B3' : 'rgba(45, 212, 191, 0.55)'}
                    strokeWidth="2.5"
                    onMouseEnter={() => setActiveOrgan('heart')}
                    onMouseLeave={() => setActiveOrgan(null)}
                    className="cursor-pointer transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  />

                  {/* Pulsing Bioluminescent Heart at Center Chest */}
                  <motion.circle
                    cx="100"
                    cy="120"
                    r="8"
                    fill="#05D3B3"
                    animate={{
                      scale: [1, 1.35, 1],
                      opacity: [0.75, 1, 0.75],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.9,
                      ease: "easeInOut",
                    }}
                    className="drop-shadow-[0_0_12px_#05D3B3]"
                  />
                  <motion.circle
                    cx="100"
                    cy="120"
                    r="16"
                    fill="none"
                    stroke="rgba(5, 211, 179, 0.4)"
                    strokeWidth="1.5"
                    animate={{
                      scale: [1, 1.8],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "easeOut",
                    }}
                  />

                  {/* Limbs & Posture Lines */}
                  <path
                    d="M70 180 L60 250 M130 180 L140 250 M85 200 L85 350 M115 200 L115 350"
                    stroke="rgba(45, 212, 191, 0.35)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>

                {/* Floating Organ Tooltips */}
                <AnimatePresence>
                  {activeOrgan === 'brain' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="mermaid-glass absolute top-[10%] right-[15%] p-3.5 rounded-2xl shadow-[0_4px_24px_rgba(5,211,179,0.3)] z-20 pointer-events-none"
                    >
                      <p className="text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-widest mb-1">Neural Activity</p>
                      <p className="text-lg font-black text-foreground">Optimal 99.4%</p>
                      <div className="w-24 h-1.5 bg-teal-500/20 rounded-full mt-2 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-teal-400 to-[#05D3B3]" animate={{ width: ['40%', '85%', '60%'] }} transition={{ repeat: Infinity, duration: 2 }} />
                      </div>
                    </motion.div>
                  )}
                  {activeOrgan === 'heart' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="mermaid-glass absolute top-[35%] left-[5%] p-3.5 rounded-2xl shadow-[0_4px_24px_rgba(5,211,179,0.3)] z-20 pointer-events-none"
                    >
                      <p className="text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-widest mb-1">Cardiac Rhythm</p>
                      <p className="text-2xl font-black text-foreground font-mono flex items-center gap-1">
                        72 <span className="text-xs font-normal text-muted-foreground">bpm</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mini Dashboard Panels (Live AI Preview in Mermaid Glass) */}
              
              {/* SpO2 Level Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="mermaid-glass absolute top-[65%] -right-2 md:-right-8 lg:-right-12 w-44 md:w-52 p-3.5 md:p-4 rounded-3xl shadow-xl z-[30]"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] md:text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-widest">SpO2 Level</span>
                  <span className="w-2 h-2 rounded-full bg-[#05D3B3] animate-pulse shadow-[0_0_8px_#05D3B3]" />
                </div>
                <div className="flex items-end gap-1 md:gap-2">
                  <span className="text-2xl md:text-3xl font-black text-foreground font-mono">98</span>
                  <span className="text-teal-500 dark:text-teal-300 text-xs md:text-sm font-bold mb-1">%</span>
                </div>
                <div className="mt-2 md:mt-3 relative h-1.5 bg-teal-500/20 rounded-full overflow-hidden">
                  <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-[#05D3B3]" initial={{ width: "0%" }} animate={{ width: "98%" }} transition={{ duration: 1.5, delay: 1 }} />
                </div>
                <p className="mt-2 text-[8px] md:text-[9px] text-teal-600/80 dark:text-teal-400/80 font-bold uppercase text-center tracking-widest">Condition: Stable</p>
              </motion.div>

              {/* AI Intelligence Stream Card */}
              <motion.div 
                animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="mermaid-glass absolute top-[5%] -left-8 md:-left-16 w-48 md:w-56 p-3.5 md:p-4 rounded-3xl shadow-xl z-[30]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-[#05D3B3] drop-shadow-[0_0_8px_rgba(5,211,179,0.8)]" />
                  <span className="text-[9px] md:text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-widest">AI Intelligence</span>
                </div>
                <p className="text-[10px] text-foreground font-medium mb-2 opacity-80 uppercase tracking-tighter">Neural analysis stream...</p>
                <div className="flex items-end h-6 md:h-8 gap-0.5 md:gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="w-full bg-gradient-to-t from-teal-500 to-[#05D3B3] rounded-t-sm"
                      animate={{ height: ['15%', '100%', '25%'] }}
                      transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: i * 0.08 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Health Score Card */}
              <motion.div 
                animate={{ y: [0, -12, 0], x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
                className="mermaid-glass absolute top-[45%] -left-4 md:-left-12 w-36 md:w-40 p-3.5 rounded-3xl shadow-xl z-[40]"
              >
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Health Score</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-foreground font-mono">94</span>
                  <Zap className="h-4 w-4 text-[#05D3B3] fill-[#05D3B3] drop-shadow-[0_0_8px_#05D3B3]" />
                </div>
                <div className="h-1 bg-teal-500/20 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-[#05D3B3] w-[94%]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* --- Micro Analytics Strip in Mermaid Glass --- */}
        <section className="mermaid-glass border-x-0 rounded-none py-7 relative z-10 my-12">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-24 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3] drop-shadow-[0_2px_12px_rgba(5,211,179,0.4)]">98%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prediction Accuracy</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3] drop-shadow-[0_2px_12px_rgba(5,211,179,0.4)]">{"<"}1s</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Real-time Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#05D3B3] drop-shadow-[0_2px_12px_rgba(5,211,179,0.4)]">24/7</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Tracking Uptime</p>
            </div>
          </div>
        </section>

        {/* --- Features Section in Mermaid Glass Bento --- */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-display font-black text-foreground mb-4">Core Architecture</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our streamlined health interface houses an array of advanced diagnostic tools designed for seamless human-machine interaction.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Activity, title: "Real-Time Monitoring", desc: "Instantly synchronize with wearable IoT sensors. Track heart rate, oxygen levels, and temperature with zero latency." },
                { icon: Brain, title: "AI-Based Predictions", desc: "Our neural network analyzes historical health data to predict potential medical anomalies before they become critical." },
                { icon: ShieldAlert, title: "Emergency Alerts", desc: "Automated trigger system immediately notifies emergency contacts and designated medical personnel if vitals drop." }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }}
                  className="mermaid-glass p-8 rounded-3xl hover:border-teal-400/50 hover:shadow-[0_12px_36px_rgba(13,148,136,0.25)] transition-all duration-300 group"
                >
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center mb-6 text-teal-600 dark:text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                  >
                    <feature.icon className="w-7 h-7" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-wide">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="mermaid-glass p-12 rounded-[3rem] text-center overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(5,211,179,0.15)_0%,_transparent_70%)] pointer-events-none" />
              
              <Zap className="h-12 w-12 text-[#05D3B3] mx-auto mb-6 animate-pulse drop-shadow-[0_0_16px_rgba(5,211,179,0.8)]" />
              <h2 className="text-4xl md:text-5xl font-black font-display text-foreground mb-6">Start Monitoring Your Health Today.</h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Join the next generation of predictive healthcare. Secure, private, and powered by advanced AI intelligence.</p>
              
              <MagneticButton>
                <Button size="lg" asChild className="mermaid-btn h-16 px-12 rounded-full font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(13,148,136,0.45)] hover:shadow-[0_12px_40px_rgba(5,211,179,0.6)] group">
                  <Link to="/signup">
                    <span className="relative z-10 flex items-center gap-2">Initialize Now <Globe className="w-5 h-5 group-hover:animate-spin" /></span>
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </div>
        </section>

      </main>

      {/* --- Footer in Mermaid Glass --- */}
      <footer className="relative z-10 border-t border-teal-500/20 bg-background/80 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-600 dark:text-teal-300" />
            <span className="font-display font-bold text-foreground tracking-wider">HealthPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">AI</span></span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">© 2026 HealthPulse Intelligence. All systems nominal.</p>
          <Button variant="link" className="text-teal-600 dark:text-teal-400 hover:underline text-xs tracking-widest uppercase font-mono" asChild>
            <Link to="/admin-login">Sys_Admin Uplink</Link>
          </Button>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-2xl border-t border-teal-500/20 z-40 md:hidden flex items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl">
        <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-teal-500/30 bg-background/80 text-foreground">
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild className="mermaid-btn flex-1 h-12 rounded-2xl font-bold text-white shadow-lg shadow-teal-500/25">
          <Link to="/signup">Get Started →</Link>
        </Button>
      </div>
    </div>
  );
}
