import { motion } from "framer-motion";
import { Activity, ShieldCheck } from "lucide-react";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

export function AntiGravityLoading({ label = "Updating Telemetry..." }: { label?: string }) {
  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden">
      <AntiGravityBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center justify-center text-center space-y-6"
      >
        {/* Glowing Neural Wave Ring */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-cyan-500/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            <ShieldCheck className="w-3 h-3" /> Biometric Link
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
            {label}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            HEALTHPULSE AI • DIGITAL TWIN HUD
          </p>
        </div>
      </motion.div>
    </div>
  );
}
