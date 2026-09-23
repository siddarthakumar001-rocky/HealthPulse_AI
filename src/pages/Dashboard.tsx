import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Thermometer,
  Wind,
  Brain,
  TrendingUp,
  Clock,
  Smartphone,
  Bell,
  FileText,
  Loader2,
  Check,
  HelpCircle,
  Wifi,
  Globe,
  Bluetooth,
  BluetoothConnected,
  Activity,
  Building,
  Sparkles,
  Radio,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StressGauge from "@/components/StressGauge";
import { computeStressScore, getStressLevel, getStressColor, getRecommendations } from "@/lib/stress";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, AnalyticsCategory, AnalyticsAction } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import HowToUseModal from "@/components/HowToUseModal";
import { bleManager } from "@/lib/ble";
import axios from "axios";
import MagneticWrapper from "@/components/dashboard/MagneticWrapper";
import ParallaxWrapper from "@/components/dashboard/ParallaxWrapper";
import HumanBodyView from "@/components/dashboard/HumanBodyView";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import Feedback from "@/components/Feedback";
import { motion } from "framer-motion";

interface HealthReading {
  heart_rate: number;
  spo2: number;
  temperature: number;
  timestamp: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [latest, setLatest] = useState<HealthReading>({
    heart_rate: 72,
    spo2: 98,
    temperature: 36.6,
    timestamp: new Date().toISOString(),
  });

  const [onboarding, setOnboarding] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);
  const [hasDevice, setHasDevice] = useState<boolean | null>(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"cloud" | "local" | "ble">(
    (localStorage.getItem("healthpulse_connection_mode") as any) || "cloud"
  );
  const [bleStatus, setBleStatus] = useState<string>(bleManager.status);
  const [fingerPresent, setFingerPresent] = useState<boolean>(true);
  const [bleData, setBleData] = useState<any>(null);

  // Vitals Update Modal
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [manualHR, setManualHR] = useState(72);
  const [manualSpO2, setManualSpO2] = useState(98);
  const [manualTemp, setManualTemp] = useState(36.6);
  const [savingVitals, setSavingVitals] = useState(false);

  // Show guide on first visit
  useEffect(() => {
    const seen = localStorage.getItem("healthpulse_guide_seen");
    if (!seen) {
      setShowGuide(true);
      localStorage.setItem("healthpulse_guide_seen", "true");
    }
  }, []);

  // ── 1. Fetch authentic real-time readings from backend / MongoDB ──
  const fetchRealtimeData = async () => {
    if (!user) return;
    try {
      const [devices, onboardingData, latestAi, dbReadings] = await Promise.all([
        api.get("/devices").catch(() => []),
        api.get("/onboarding").catch(() => null),
        api.get("/ai/latest").catch(() => null),
        api.get(`/device/${user.id || (user as any)._id}`).catch(() => []),
      ]);

      if (onboardingData) setOnboarding(onboardingData);
      if (latestAi) setAiAnalysis(latestAi);
      if (devices && devices.length > 0) setDevice(devices[0]);

      if (Array.isArray(dbReadings) && dbReadings.length > 0) {
        setReadings(dbReadings);
        const mostRecent = dbReadings[dbReadings.length - 1];
        setLatest(mostRecent);
        setManualHR(mostRecent.heart_rate || 72);
        setManualSpO2(mostRecent.spo2 || 98);
        setManualTemp(mostRecent.temperature || 36.6);
      }
    } catch (err) {
      console.error("Dashboard real-time sync failed:", err);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // ── 2. BLE Live Sensor Subscription ───────────────────────────
  useEffect(() => {
    if (connectionMode !== "ble") return;

    setBleStatus(bleManager.status);
    if (bleManager.isConnected()) {
      setHasDevice(true);
      setDevice({ device_id: bleManager.deviceName || "ESP32-BLE-HEALTH" });
      setBleData(bleManager.data);
    }

    const unsubData = bleManager.onData((data) => {
      setBleData(data);
      const newReading: HealthReading = {
        heart_rate: data.heartRate ?? latest.heart_rate,
        spo2: data.spo2 ?? latest.spo2,
        temperature: data.temperature ?? latest.temperature,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setLatest(newReading);
      setFingerPresent(data.fingerPresent || false);
      setReadings((prev) => [...prev.slice(-24), newReading]);
      setHasDevice(true);

      // Persist real-time sensor reading to MongoDB
      if (user) {
        api.post("/device/data", {
          deviceId: "ESP32-BLE-HEALTH",
          heartRate: data.heartRate,
          spo2: data.spo2,
          temperature: data.temperature || 36.6,
        }).catch(() => {});
      }
    });

    const unsubStatus = bleManager.onStatus((status) => {
      setBleStatus(status);
      if (status === "disconnected") {
        toast({ title: "Bluetooth Disconnected", variant: "destructive" });
      }
    });

    return () => {
      unsubData();
      unsubStatus();
    };
  }, [connectionMode, latest]);

  // ── 3. Manual / Live Vitals Ingestion ─────────────────────────
  const handleSaveRealtimeVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVitals(true);
    try {
      const payload = {
        deviceId: device?.deviceId || "ESP32-LIVE-SENSOR",
        heartRate: Number(manualHR),
        spo2: Number(manualSpO2),
        temperature: Number(manualTemp),
      };

      await api.post("/device/data", payload);

      const newReading: HealthReading = {
        heart_rate: Number(manualHR),
        spo2: Number(manualSpO2),
        temperature: Number(manualTemp),
        timestamp: new Date().toISOString(),
      };

      setLatest(newReading);
      setReadings((prev) => [...prev.slice(-24), newReading]);
      setVitalsModalOpen(false);

      toast({
        title: "Real-Time Vitals Synced",
        description: `Logged Heart Rate: ${manualHR} BPM, SpO2: ${manualSpO2}%, Temp: ${manualTemp}°C to MongoDB.`,
      });

      // Trigger automatic AI analysis on real-time data
      await api.post("/ai/analyze", { sensorData: payload }).catch(() => {});
      await fetchRealtimeData();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "Could not save vitals",
        variant: "destructive",
      });
    } finally {
      setSavingVitals(false);
    }
  };

  const handleBLEConnect = async () => {
    try {
      await bleManager.connect();
      setConnectionMode("ble");
      setBleStatus("connected");
      localStorage.setItem("healthpulse_connection_mode", "ble");
      toast({ title: "Bluetooth Connected!", description: `Linked to ${bleManager.deviceName || "ESP32 Device"}` });
    } catch (err: any) {
      const isWindows = navigator.platform.toLowerCase().includes("win");
      const helpMsg = isWindows ? "\n\nTip: Remove 'ESP32-Health' from Windows Bluetooth settings before connecting." : "";
      toast({
        title: "Bluetooth Connection",
        description: err.message + helpMsg,
        variant: "destructive",
      });
    }
  };

  const toggleConnectionMode = () => {
    const modes: Array<"cloud" | "local" | "ble"> = ["cloud", "local", "ble"];
    const currentIdx = modes.indexOf(connectionMode);
    const newMode = modes[(currentIdx + 1) % modes.length];

    if (newMode === "ble") {
      handleBLEConnect();
      return;
    }

    setConnectionMode(newMode);
    localStorage.setItem("healthpulse_connection_mode", newMode);
    toast({
      title: `Switched to ${newMode.toUpperCase()} mode`,
      description: newMode === "local" ? "Fetching directly from local ESP32 IP" : "Syncing live with Cloud Database",
    });
  };

  const handleCheckHealth = async () => {
    setIsAnalyzing(true);
    try {
      const result: any = await api.post("/ai/analyze", {
        sensorData: {
          heartRate: latest.heart_rate,
          spo2: latest.spo2,
          temperature: latest.temperature,
        },
      });

      setAiAnalysis(result?.data || result);
      toast({
        title: "Health Diagnostic Synthesized",
        description: `Condition: ${result?.condition || "Analysis complete"}`,
      });

      navigate("/ai-suggestions");
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message || "Could not analyze health data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const symptomCount = onboarding
    ? (onboarding.common_symptoms?.length || 0) +
      (onboarding.ent_issues?.length || 0) +
      (onboarding.ocular_issues?.length || 0) +
      (onboarding.pain_locations?.length || 0)
    : 0;

  const sleepHours = onboarding?.sleep_hours?.[0] || 7;

  const stressScore = computeStressScore({
    heartRate: latest.heart_rate,
    temperature: latest.temperature,
    symptomCount,
    sleepHours,
  });

  const stressLevel = aiAnalysis?.riskLevel ? (aiAnalysis.riskLevel.toUpperCase() as any) : getStressLevel(stressScore).toUpperCase();
  const displayHealthScore = aiAnalysis?.healthScore !== undefined ? aiAnalysis.healthScore : Math.max(0, 100 - stressScore);

  const chartData = readings.map((r, i) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : `T-${20 - i}s`,
    hr: r.heart_rate,
    temp: r.temperature,
    stress: computeStressScore({ heartRate: r.heart_rate, temperature: r.temperature }),
  }));

  return (
    <DashboardLayout>
      <div className="relative space-y-6 max-w-[1600px] mx-auto z-10 pb-12">
        {/* ── HERO HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2 px-2 md:px-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-3.5 w-3.5 rounded-full"
                style={{ background: "#E35336", boxShadow: "0 0 14px rgba(227,83,54,0.7)" }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <h1
                className="font-display text-2xl md:text-4xl font-black tracking-[0.15em] text-foreground"
              >
                HEALTH<span className="text-primary">PULSE</span> AI
              </h1>
            </div>
            <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-bold pl-6 text-muted-foreground">
              {t("landing.heroDesc", "Next-Gen Biometric Intelligence HUD • Real-Time Telemetry Stream")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Record / Sync Vitals Button */}
            <MagneticWrapper>
              <button
                onClick={() => setVitalsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider bg-card border border-border text-foreground hover:bg-muted transition shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5 text-primary" />
                {t("dashboard.updateRealVitals", "Update Real Vitals")}
              </button>
            </MagneticWrapper>

            {/* Mode Switcher */}
            <MagneticWrapper>
              <button
                onClick={toggleConnectionMode}
                className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase px-3 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition shadow-sm"
              >
                <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                {connectionMode === "ble" && bleStatus === "connected"
                  ? t("dashboard.bleSynced", "BLE SENSOR SYNCED")
                  : connectionMode === "local"
                  ? t("dashboard.localIp", "LOCAL IP")
                  : t("dashboard.cloudStream", "CLOUD STREAM")}
              </button>
            </MagneticWrapper>

            {/* BLE Button */}
            <MagneticWrapper>
              <button
                onClick={handleBLEConnect}
                className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase px-3 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition shadow-sm"
              >
                <Bluetooth className="h-3.5 w-3.5 text-primary" />
                {connectionMode === "ble" && bleStatus === "connected"
                  ? t("dashboard.esp32Linked", "ESP32 LINKED")
                  : t("dashboard.connectBle", "CONNECT BLE")}
              </button>
            </MagneticWrapper>

            {/* Check Health Action Button */}
            <MagneticWrapper>
              <button
                onClick={handleCheckHealth}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-primary-foreground transition shadow-md hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #E35336 0%, #FF7E67 100%)",
                  boxShadow: "0 4px 18px rgba(227,83,54,0.45)",
                  border: "none",
                  cursor: isAnalyzing ? "wait" : "pointer",
                }}
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                {t("dashboard.checkMyHealth", "CHECK MY HEALTH")}
              </button>
            </MagneticWrapper>

            {/* Public Health Network Quick Link */}
            <MagneticWrapper>
              <button
                onClick={() => navigate("/phc-command")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider bg-card border border-border text-foreground hover:bg-muted transition shadow-sm"
              >
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                {t("dashboard.phcCommandHub", "PHC Command Hub")}
              </button>
            </MagneticWrapper>
          </div>
        </div>

        {/* ── MAIN 3-PANEL GRID ──────────────────────────── */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-4 gap-4 xl:gap-6">
          {/* LEFT: Vitals Panel */}
          <ParallaxWrapper depth={0.03} className="lg:col-span-1">
            <VitalsPanel
              heartRate={latest.heart_rate}
              spo2={latest.spo2}
              temperature={latest.temperature}
              onboarding={onboarding}
            />
          </ParallaxWrapper>

          {/* CENTER: Holographic Digital Twin */}
          <ParallaxWrapper depth={0.05} className="lg:col-span-2">
            <HumanBodyView
              heartRate={latest.heart_rate}
              fingerPresent={fingerPresent}
              status="connected"
              painAreas={onboarding?.pain_locations || []}
            />
          </ParallaxWrapper>

          {/* RIGHT: AI Insights & Health Score */}
          <ParallaxWrapper depth={0.03} className="lg:col-span-1">
            <AIInsightsPanel
              healthScore={displayHealthScore}
              stressLevel={stressLevel}
              condition={aiAnalysis?.condition || "Nominal / Vitality Stable"}
              message={
                aiAnalysis?.message ||
                "Real-time biometrics within normal physiological baseline. AI engine monitoring for anomalies."
              }
              insights={aiAnalysis?.insights || []}
              isEmergency={aiAnalysis?.type === "EMERGENCY"}
              recommendations={aiAnalysis?.recommendations}
              onboarding={onboarding}
              rmssd={bleData?.rmssd || 42}
              rawBleData={bleData?.raw}
            />
          </ParallaxWrapper>
        </motion.div>

        {/* ── BOTTOM: Real-Time Analytics & ECG Console ──────────────────── */}
        <div className="w-full">
          <AnalyticsPanel chartData={chartData} />
        </div>

        {/* ── USER FEEDBACK ───────────────────────────────────── */}
        <ParallaxWrapper
          depth={0.02}
          className="w-full rounded-2xl p-4 md:p-8 relative overflow-hidden mb-12 bg-white/60 dark:bg-[#050816]/70 border border-cyan-500/10 shadow-[0_0_20px_rgba(0,229,255,0.04)] backdrop-blur-md"
        >
          <div className="relative z-10">
            <Feedback />
          </div>
        </ParallaxWrapper>
      </div>

      {/* ── REAL-TIME VITALS UPDATE DIALOG ────────────────────── */}
      <Dialog open={vitalsModalOpen} onOpenChange={setVitalsModalOpen}>
        <DialogContent className="max-w-md bg-[rgb(8,14,28)] border border-cyan-500/30 text-white shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Sync Real-Time Biometrics
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Input and persist your exact live physical sensor measurements into the database
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRealtimeVitals} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-400" /> Heart Rate (BPM)
              </Label>
              <Input
                type="number"
                min="35"
                max="220"
                value={manualHR}
                onChange={(e) => setManualHR(Number(e.target.value))}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-cyan-400" /> Oxygen Saturation (SpO2 %)
              </Label>
              <Input
                type="number"
                min="70"
                max="100"
                value={manualSpO2}
                onChange={(e) => setManualSpO2(Number(e.target.value))}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-amber-400" /> Body Temperature (°C)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="32"
                max="43"
                value={manualTemp}
                onChange={(e) => setManualTemp(Number(e.target.value))}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVitalsModalOpen(false)}
                className="text-slate-400 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingVitals}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs"
              >
                {savingVitals ? "Syncing..." : "Sync Live Vitals"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <HowToUseModal open={showGuide} onOpenChange={setShowGuide} />
    </DashboardLayout>
  );
}
