import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Activity, Brain, Bell, Heart, ShieldAlert, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "../components/ThemeToggle";
import LiquidCursor from "@/components/LiquidCursor";

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
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2500);
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
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-primary font-mono overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          <Activity className="h-16 w-16 mb-4 animate-pulse text-primary drop-shadow-[0_0_15px_rgba(227,83,54,0.6)]" />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-foreground">Initializing AI Health System</h1>
          <div className="mt-8 h-1 w-64 bg-primary/20 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 bottom-0 w-1/2 bg-primary shadow-[0_0_10px_rgba(227,83,54,0.8)]"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Establishing neural link...
          </motion.p>
        </motion.div>
        {/* Scanning Line overlay */}
        <motion.div
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans cursor-none">
      <LiquidCursor />
      
      {/* --- Animated Background Elements --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Soft Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        {/* Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `linear-gradient(rgba(243, 213, 192, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 213, 192, 0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            transformOrigin: 'top center',
          }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/50 rounded-full shadow-[0_0_8px_rgba(227,83,54,0.4)]"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* --- Navigation --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="fixed top-0 w-full z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl shadow-sm"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/25 group-hover:bg-primary/20 transition-all">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary drop-shadow-[0_0_8px_rgba(227,83,54,0.5)]" />
            </div>
            <span className="font-display text-lg md:text-2xl font-black tracking-wider text-foreground">
              HealthPulse <span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <MagneticButton>
              <Button variant="ghost" asChild className="text-foreground hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-widest text-xs hidden md:inline-flex">
                <Link to="/login">{t("landing.logIn", "Login")}</Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button asChild className="relative group overflow-hidden bg-transparent border border-primary text-primary hover:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs h-9 md:h-10 px-4 md:px-6 rounded-full shadow-[0_0_15px_rgba(227,83,54,0.25)] hover:shadow-[0_0_20px_rgba(227,83,54,0.4)] transition-all duration-300">
                <Link to="/signup">
                  <span className="relative z-10">{t("landing.getStarted", "Access")}</span>
                  <div className="absolute inset-0 bg-primary transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out -z-0" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">System Online v2.4</span>
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
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff7e67] drop-shadow-[0_2px_15px_rgba(227,83,54,0.3)]"
              >
                Monitoring System
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed font-light"
            >
              Merge human biology with artificial intelligence. Connect your telemetry devices for real-time tracking, predictive diagnosis, and instant emergency alerts.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(227,83,54,0.35)] hover:shadow-[0_6px_25px_rgba(227,83,54,0.5)] transition-all">
                  <Link to="/signup" className="flex items-center justify-center">Initialize Scan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </MagneticButton>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card shadow-sm flex items-center justify-center text-xs">
                      <Activity className="h-4 w-4 text-primary" />
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

          {/* Right: Live AI Preview & Human Body */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="flex-1 relative w-full max-w-sm md:max-w-lg mx-auto lg:mx-0 mt-8 lg:mt-0"
            style={{ x: xParallax * -1, y: yParallax * -1 }} // Opposite parallax
          >
            <div className="relative aspect-[3/4] md:aspect-square">
              {/* Glowing Background Sphere */}
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />

              {/* Human Body Interactive SVG */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] drop-shadow-[0_0_15px_rgba(227,83,54,0.2)]">
                  {/* Head/Brain */}
                  <motion.path
                    d="M100 20 C120 20, 120 60, 100 70 C80 60, 80 20, 100 20 Z"
                    fill="transparent"
                    stroke={activeOrgan === 'brain' ? '#E35336' : 'rgba(227,83,54,0.4)'}
                    strokeWidth="2"
                    onMouseEnter={() => setActiveOrgan('brain')}
                    onMouseLeave={() => setActiveOrgan(null)}
                    className="cursor-pointer transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
                  {/* Chest/Heart */}
                  <motion.path
                    d="M80 80 C60 80, 50 120, 70 180 C100 200, 100 200, 130 180 C150 120, 140 80, 120 80 C110 80, 100 100, 100 100 C100 100, 90 80, 80 80 Z"
                    fill="transparent"
                    stroke={activeOrgan === 'heart' ? '#E35336' : 'rgba(227,83,54,0.4)'}
                    strokeWidth="2"
                    onMouseEnter={() => setActiveOrgan('heart')}
                    onMouseLeave={() => setActiveOrgan(null)}
                    className="cursor-pointer transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  />
                  {/* Limbs (Static outline) */}
                  <path
                    d="M70 180 L60 250 M130 180 L140 250 M85 200 L85 350 M115 200 L115 350"
                    stroke="rgba(227,83,54,0.25)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>

                {/* Floating Organ Tooltips */}
                <AnimatePresence>
                  {activeOrgan === 'brain' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-[10%] right-[15%] bg-card/95 border border-primary/40 p-3 rounded-xl shadow-[0_4px_20px_rgba(227,83,54,0.2)] z-20 pointer-events-none"
                    >
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Neural Activity</p>
                      <p className="text-lg font-black text-foreground">Optimal</p>
                      <div className="w-24 h-1 bg-primary/20 rounded-full mt-2 overflow-hidden">
                        <motion.div className="h-full bg-primary" animate={{ width: ['40%', '80%', '60%'] }} transition={{ repeat: Infinity, duration: 2 }} />
                      </div>
                    </motion.div>
                  )}
                  {activeOrgan === 'heart' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-[35%] left-[5%] bg-card/95 border border-primary/40 p-3 rounded-xl shadow-[0_4px_20px_rgba(227,83,54,0.2)] z-20 pointer-events-none"
                    >
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Cardiac Rhythm</p>
                      <p className="text-2xl font-black text-foreground font-mono flex items-center gap-1">72 <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mini Dashboard Panels (Live AI Preview) */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-[65%] -right-2 md:-right-8 lg:-right-12 w-40 md:w-48 bg-card/95 border border-border p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-xl z-[30]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">SpO2 Level</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-end gap-1 md:gap-2">
                  <span className="text-2xl md:text-3xl font-black text-foreground font-mono">98</span>
                  <span className="text-primary text-xs md:text-sm font-bold mb-1">%</span>
                </div>
                <div className="mt-2 md:mt-3 relative h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div className="absolute top-0 left-0 h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "98%" }} transition={{ duration: 1.5, delay: 1 }} />
                </div>
                <p className="mt-2 text-[8px] md:text-[9px] text-muted-foreground uppercase text-center tracking-widest">Condition: Stable</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute top-[5%] -left-8 md:-left-16 w-48 md:w-56 bg-card/95 border border-border p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-xl z-[30]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">AI Intelligence</span>
                </div>
                <p className="text-[10px] text-foreground font-medium mb-2 opacity-80 uppercase tracking-tighter">Neural analysis stream...</p>
                <div className="flex items-end h-6 md:h-8 gap-0.5 md:gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="w-full bg-primary/40 rounded-t-sm"
                      animate={{ height: ['20%', '100%', '20%'] }}
                      transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -12, 0], x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
                className="absolute top-[45%] -left-4 md:-left-12 w-32 md:w-36 bg-card/95 border border-border p-3 rounded-2xl shadow-lg backdrop-blur-xl z-[40]"
              >
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Health Score</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-foreground font-mono">94</span>
                  <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                </div>
                <div className="h-0.5 bg-muted mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[94%]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* --- Micro Analytics Strip --- */}
        <section className="border-y border-border/80 bg-card/60 backdrop-blur-sm py-6 relative z-10">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-24 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-primary drop-shadow-[0_2px_8px_rgba(227,83,54,0.3)]">98%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prediction Accuracy</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-primary drop-shadow-[0_2px_8px_rgba(227,83,54,0.3)]">{"<"}1s</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Real-time Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono text-primary drop-shadow-[0_2px_8px_rgba(227,83,54,0.3)]">24/7</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Tracking Uptime</p>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
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
                  className="group relative bg-card border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary"
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
              className="relative bg-card border border-border p-12 rounded-[3rem] text-center overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(227,83,54,0.08)_0%,_transparent_70%)] pointer-events-none" />
              
              <Zap className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse drop-shadow-[0_0_12px_rgba(227,83,54,0.5)]" />
              <h2 className="text-4xl md:text-5xl font-black font-display text-foreground mb-6">Start Monitoring Your Health Today.</h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Join the next generation of predictive healthcare. Secure, private, and powered by advanced AI intelligence.</p>
              
              <MagneticButton>
                <Button size="lg" asChild className="relative overflow-hidden h-16 px-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest shadow-[0_4px_25px_rgba(227,83,54,0.35)] hover:shadow-[0_6px_30px_rgba(227,83,54,0.5)] transition-all group">
                  <Link to="/signup">
                    <span className="relative z-10 flex items-center gap-2">Initialize Now <Globe className="w-5 h-5 group-hover:animate-spin" /></span>
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="relative z-10 border-t border-border bg-card/70 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground tracking-wider">HealthPulse <span className="text-primary">AI</span></span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">© 2026 HealthPulse Intelligence. All systems nominal.</p>
          <Button variant="link" className="text-primary hover:underline text-xs tracking-widest uppercase font-mono" asChild>
            <Link to="/admin-login">Sys_Admin Uplink</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
