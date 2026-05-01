import { motion } from "framer-motion";
import { Brain, AlertTriangle, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIInsightsPanelProps {
  healthScore: number;
  stressLevel: string;
  condition: string;
  message: string;
  isEmergency: boolean;
}

export default function AIInsightsPanel({ healthScore, stressLevel, condition, message, isEmergency }: AIInsightsPanelProps) {
  const { t } = useTranslation();
  const isHighRisk = (stressLevel === 'HIGH' || isEmergency) && condition !== 'NOMINAL' && condition !== '';
  const mainColor = isHighRisk ? "text-destructive neon-text-pink" : "text-cyan-600 dark:text-cyan-400 dark:neon-text-cyan";
  const barColor = isHighRisk ? "bg-destructive shadow-[0_0_15px_#ff00ff]" : "bg-cyan-500 shadow-[0_0_15px_#00f3ff]";

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* AI STATUS HEADER */}
      <motion.div className="liquid-glass rounded-2xl p-6 holographic-edge" whileHover={{ scale: 1.03, y: -2 }}>
        <div className="flex items-center gap-3 mb-4">
          <Brain className={`h-6 w-6 ${mainColor}`} />
          <h2 className="font-display text-lg tracking-widest uppercase">{t("reports.aiAssess")}</h2>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-foreground/80 tracking-widest font-bold">SYSTEM_STATUS</span>
          <span className={`font-display text-2xl font-bold uppercase ${mainColor}`}>
            {stressLevel === 'LOW' ? t("reports.normal") : stressLevel || 'STANDBY'}
          </span>
        </div>
      </motion.div>

      {/* RISK SCORE */}
      <motion.div className="liquid-glass rounded-2xl p-6 holographic-edge" whileHover={{ scale: 1.03, y: -2 }}>
        <h3 className="font-mono text-xs text-foreground/90 uppercase tracking-widest mb-6 font-bold">{t("dashboard.healthScore")}</h3>
        
        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-6xl font-bold">{healthScore}</span>
          <span className="font-mono text-xs text-foreground/80 pb-2 font-bold">/ 100</span>
        </div>

        <div className="w-full h-1 bg-muted rounded-full mt-2 relative">
          <motion.div 
            className={`absolute top-0 left-0 h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center font-mono text-[10px] uppercase">
          <span className="text-foreground/80 font-bold">{t("reports.normal")}</span>
          <span className={isHighRisk ? "text-destructive" : "text-green-600 dark:text-green-400"}>
            [{stressLevel} {t("dashboard.risk")}]
          </span>
        </div>
      </motion.div>

      {/* TERMINAL LOGS */}
      <motion.div className="liquid-glass rounded-2xl p-6 flex-1 flex flex-col holographic-edge" whileHover={{ scale: 1.03, y: -2 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs text-foreground/90 uppercase tracking-widest font-bold">Neural Feed</h3>
          {isHighRisk && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
        </div>
        
        <div className="flex-1 bg-muted/40 rounded-xl p-4 font-mono text-xs overflow-hidden relative border border-foreground/10">
          <motion.div 
            className="flex flex-col gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">&gt;</span>
              <span className="text-cyan-700 dark:text-cyan-400">Initializing biometric scan...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">&gt;</span>
              <span className="text-cyan-700 dark:text-cyan-400">Cross-referencing historical data...</span>
            </div>
            <div className="flex gap-2">
              <span className={isHighRisk ? "text-destructive" : "text-green-600 dark:text-green-400"}>&gt;</span>
              <span className={`leading-relaxed ${isHighRisk ? "text-destructive" : "text-green-700 dark:text-green-400"}`}>
                {message || "No anomalies detected. Vitals within nominal parameters."}
              </span>
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-muted/60 dark:from-black/60 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
