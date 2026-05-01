import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Thermometer, Wind, Brain, TrendingUp, Clock, Smartphone, Bell, FileText, Loader2, Check, HelpCircle, Wifi, Globe, Bluetooth, BluetoothConnected } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import StressGauge from "@/components/StressGauge";
import { computeStressScore, getStressLevel, getStressColor, getRecommendations } from "@/lib/stress";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
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
import { motion } from "framer-motion";

interface HealthReading {
  heart_rate: number;
  spo2: number;
  temperature: number;
  timestamp: string;
}

import Feedback from "@/components/Feedback";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [latest, setLatest] = useState<HealthReading | null>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);
  const [hasDevice, setHasDevice] = useState<boolean | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"cloud" | "local" | "ble">(
    (localStorage.getItem("healthpulse_connection_mode") as any) || "cloud"
  );
  const [bleStatus, setBleStatus] = useState<string>(bleManager.status);
  const [fingerPresent, setFingerPresent] = useState<boolean>(false);

  // Show guide on first visit
  useEffect(() => {
    const seen = localStorage.getItem("healthpulse_guide_seen");
    if (!seen) {
      setShowGuide(true);
      localStorage.setItem("healthpulse_guide_seen", "true");
    }
  }, []);

  // ── BLE Mode: subscribe to live sensor data ─────────────────
  useEffect(() => {
    if (connectionMode !== "ble") return;

    // If BLE is connected, mark device as present
    if (bleManager.isConnected()) {
      setHasDevice(true);
      setDevice({ device_id: "ESP32-BLE-HEALTH" });
    }

    const unsubData = bleManager.onData((data) => {
      const newReading: HealthReading = {
        heart_rate: data.heartRate ?? 0,
        spo2: data.spo2 ?? 0,
        temperature: data.temperature ?? 0,
        timestamp: data.timestamp,
      };
      setLatest(newReading);
      setFingerPresent(data.fingerPresent || false);
      setReadings(prev => [...prev.slice(-19), newReading]);
      setHasDevice(true);
      if (!device) setDevice({ device_id: bleManager.deviceName || "ESP32-BLE-HEALTH" });

      // Sync to cloud backend in background (non-blocking)
      api.post("/device/data", {
        deviceId: "ESP32-BLE-HEALTH",
        heartRate: data.heartRate,
        spo2: data.spo2,
        temperature: data.temperature || 36.5,
      }).catch(() => { });
    });

    const unsubStatus = bleManager.onStatus((status) => {
      setBleStatus(status);
      if (status === 'disconnected') {
        toast({ title: "Bluetooth Disconnected", variant: "destructive" });
      }
    });

    return () => { unsubData(); unsubStatus(); };
  }, [connectionMode]);

  const fetchLocalData = async () => {
    try {
      const savedIp = localStorage.getItem("healthpulse_local_ip") || "192.168.4.1";
      const response = await axios.get(`http://${savedIp}/data?key=ESP32_KEY`, { timeout: 2000 });
      const data = response.data;
      const newReading: HealthReading = {
        heart_rate: data.heartRate,
        spo2: data.spo2,
        temperature: data.temperature || 36.5,
        timestamp: new Date().toISOString()
      };

      setLatest(newReading);
      setReadings(prev => [...prev.slice(-19), newReading]);
      setHasDevice(true);
      if (!device) setDevice({ device_id: "ESP32-LOCAL" });

      // Local -> Cloud Sync
      try {
        await api.post("/device/data", {
          deviceId: data.deviceId || "ESP32-LOCAL",
          heartRate: data.heartRate,
          spo2: data.spo2,
          temperature: data.temperature || 36.5
        });

        // Check offline queue and flush
        const offlineQueue = JSON.parse(localStorage.getItem('healthpulse_offline_queue') || '[]');
        if (offlineQueue.length > 0) {
          console.log(`[Sync] Flushing ${offlineQueue.length} offline records...`);
          // We could flush them all here, but for now just clear to avoid spamming
          localStorage.removeItem('healthpulse_offline_queue');
        }
      } catch (syncErr) {
        console.warn("Cloud sync failed during Local Mode. Queueing offline.", syncErr);
        // Save to offline queue
        const offlineQueue = JSON.parse(localStorage.getItem('healthpulse_offline_queue') || '[]');
        offlineQueue.push({
          deviceId: data.deviceId || "ESP32-LOCAL",
          heartRate: data.heartRate,
          spo2: data.spo2,
          temperature: data.temperature || 36.5,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('healthpulse_offline_queue', JSON.stringify(offlineQueue));
      }

    } catch (err) {
      console.warn("Local fetch failed, falling back to cloud mode check");
      setConnectionMode("cloud");
      localStorage.setItem("healthpulse_connection_mode", "cloud");
    }
  };

  const fetchData = async () => {
    if (connectionMode === "ble") {
      // BLE mode: data comes from BLE subscriptions (useEffect above), no polling needed
      return;
    }
    if (connectionMode === "local") {
      await fetchLocalData();
      return;
    }

    try {
      const [devices, onboardingData, latestAi] = await Promise.all([
        api.get("/devices"),
        api.get("/onboarding").catch(() => null),
        api.get("/ai/latest").catch(() => null)
      ]);

      if (onboardingData) setOnboarding(onboardingData);
      if (latestAi) setAiAnalysis(latestAi);

      if (!devices || devices.length === 0) {
        setHasDevice(false);
        setDevice(null);
        return;
      }

      setHasDevice(true);
      setDevice(devices[0]);
      const data = await api.get(`/device/${user.id}`);
      if (data?.length) {
        if (!latest || data[data.length - 1].timestamp !== latest.timestamp) {
          trackEvent(AnalyticsCategory.DEVICE, AnalyticsAction.DEVICE_DATA_RECEIVED);
        }
        setReadings(data);
        setLatest(data[data.length - 1]);
      }
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user, connectionMode]);

  const handleBLEConnect = async () => {
    try {
      await bleManager.connect();
      setConnectionMode("ble");
      localStorage.setItem("healthpulse_connection_mode", "ble");
      toast({ title: "Bluetooth Connected!", description: `Connected to ${bleManager.deviceName || "ESP32"}` });
    } catch (err: any) {
      toast({ title: "Bluetooth Failed", description: err.message, variant: "destructive" });
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
      description: newMode === "local" ? "Fetching data directly from ESP32" : "Syncing with cloud backend",
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      let location = { lat: null, lng: null };
      try {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (locErr) {
        console.warn("Location access denied or failed", locErr);
      }

      const result = await api.post("/ai/analyze", {
        sensorData: latest ? {
          heartRate: latest.heart_rate,
          spo2: latest.spo2,
          temperature: latest.temperature
        } : {},
        location
      });
      setAiAnalysis(result);
      trackEvent(AnalyticsCategory.HEALTH, AnalyticsAction.AI_ANALYSIS_TRIGGER);

      if (result.type === 'EMERGENCY') {
        trackEvent(AnalyticsCategory.EMERGENCY, AnalyticsAction.EMERGENCY_TRIGGER, result.condition);
      }

      toast({
        title: result.type === 'EMERGENCY' ? "EMERGENCY DETECTED" : t("dashboard.analysisComplete"),
        description: `${result.condition || result.message}`,
        variant: result.type === 'EMERGENCY' ? "destructive" : "default"
      });
    } catch (err: any) {
      toast({
        title: t("dashboard.analysisFailed"),
        description: err.response?.data?.error || "Could not analyze health data",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const symptomCount = onboarding ? (
    (onboarding.common_symptoms?.length || 0) +
    (onboarding.ent_issues?.length || 0) +
    (onboarding.ocular_issues?.length || 0) +
    (onboarding.pain_locations?.length || 0)
  ) : 0;

  const sleepHours = onboarding?.sleep_hours?.[0] || 7;

  const stressScore = computeStressScore({
    heartRate: latest?.heart_rate,
    temperature: latest?.temperature,
    symptomCount,
    sleepHours,
  });

  const stressLevel = aiAnalysis?.riskLevel ? (aiAnalysis.riskLevel.toUpperCase() as any) : getStressLevel(stressScore).toUpperCase();
  const displayHealthScore = aiAnalysis?.healthScore !== undefined ? aiAnalysis.healthScore : Math.max(0, 100 - stressScore);

  const chartData = readings.map((r, i) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : i,
    hr: r.heart_rate,
    temp: r.temperature,
    stress: computeStressScore({ heartRate: r.heart_rate, temperature: r.temperature }),
  }));

  const lastUpdated = latest ? new Date(latest.timestamp).toLocaleString() : null;

  return (
    <DashboardLayout>
      <div className="relative space-y-6 max-w-7xl mx-auto z-10">


        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 drop-shadow-sm">
              AI HEALTH PULSE
            </h1>
            <p className="font-mono text-xs text-cyan-800 dark:text-cyan-500/60 uppercase tracking-widest mt-1 font-bold">Biometric Telemetry HUD</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {connectionMode === "ble" ? (
              <MagneticWrapper>
                <Button onClick={() => { bleManager.disconnect(); setConnectionMode("cloud"); localStorage.setItem("healthpulse_connection_mode", "cloud"); }} className="glass-panel text-cyan-700 dark:text-cyan-400 border-cyan-400/30 hover:bg-cyan-900/30">
                  <BluetoothConnected className="mr-2 h-4 w-4" />
                  BLE SYNCED
                </Button>
              </MagneticWrapper>
            ) : (
              <>
                <MagneticWrapper>
                  <Button onClick={toggleConnectionMode} className="glass-panel text-blue-700 dark:text-blue-400 border-blue-400/30 hover:bg-blue-900/30">
                    {connectionMode === "local" ? <Wifi className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                    {connectionMode === "local" ? t("dashboard.switchToLocal") : t("dashboard.switchToCloud")}
                  </Button>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Button onClick={handleBLEConnect} className="glass-panel text-cyan-700 dark:text-cyan-400 border-cyan-400/30 hover:bg-cyan-900/30">
                    <Bluetooth className="mr-2 h-4 w-4" />
                    {t("deviceConnect.connectButton")}
                  </Button>
                </MagneticWrapper>
              </>
            )}

            {onboarding && (
              <MagneticWrapper>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.6)] border-none">
                  {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  {t("dashboard.analyzeHealth")}
                </Button>
              </MagneticWrapper>
            )}
          </div>
        </div>

        {hasDevice === false ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 glass-panel rounded-3xl border-dashed border-cyan-500/50 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
            <div className="h-24 w-24 rounded-full bg-cyan-900/20 flex items-center justify-center mb-6 animate-pulse">
              <Smartphone className="h-12 w-12 text-cyan-500 neon-text-cyan" />
            </div>
            <h2 className="text-3xl font-display font-black tracking-widest uppercase text-cyan-600 dark:text-cyan-400 mb-3">{t("dashboard.noDevice")}</h2>
            <p className="max-w-md mx-auto mb-8 font-mono text-sm text-cyan-800 dark:text-cyan-500/60 leading-relaxed uppercase font-bold">
              {t("dashboard.noDeviceDesc")}
            </p>
            <MagneticWrapper>
              <Button size="lg" onClick={() => navigate("/device-connect")} className="bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.6)] border-none px-12 h-14 font-display font-bold tracking-widest">
                {t("deviceConnect.connectButton")}
              </Button>
            </MagneticWrapper>
          </div>
        ) : hasDevice === null ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin shadow-[0_0_15px_rgba(0,243,255,0.5)]"></div>
                <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-spin animation-delay-150"></div>
              </div>
              <p className="font-mono text-sm text-cyan-700 dark:text-cyan-400 animate-pulse uppercase tracking-widest">{t("dashboard.syncing")}</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* LEFT PANEL: Vitals */}
              <ParallaxWrapper depth={0.03} className="lg:col-span-1 h-full floating-element">
                <VitalsPanel
                  heartRate={latest?.heart_rate || 0}
                  spo2={latest?.spo2 || 0}
                  temperature={latest?.temperature || 0}
                  onboarding={onboarding}
                />
              </ParallaxWrapper>

              {/* CENTER PANEL: Human Body */}
              <ParallaxWrapper depth={0.05} className="lg:col-span-2 h-full">
                <HumanBodyView
                  heartRate={latest?.heart_rate || 0}
                  fingerPresent={fingerPresent}
                  status={connectionMode === "ble" && bleStatus === 'connected' ? 'connected' : connectionMode === "ble" ? 'connecting' : 'disconnected'}
                  painAreas={onboarding?.pain_locations || []}
                />
              </ParallaxWrapper>

              {/* RIGHT PANEL: AI Insights */}
              <ParallaxWrapper depth={0.03} className="lg:col-span-1 h-full floating-element" style={{ animationDelay: '1s' }}>
                <AIInsightsPanel
                  healthScore={displayHealthScore}
                  stressLevel={stressLevel}
                  condition={aiAnalysis?.condition || ""}
                  message={aiAnalysis?.message || "Standing by for biometric input..."}
                  insights={aiAnalysis?.insights || []}
                  isEmergency={aiAnalysis?.type === 'EMERGENCY'}
                  recommendations={aiAnalysis?.recommendations}
                  onboarding={onboarding}
                />
              </ParallaxWrapper>
            </motion.div>

            <motion.div
              className="flex flex-col gap-6 w-full"
            >
              {/* BOTTOM PANEL: Analytics */}
              <div className="w-full">
                <AnalyticsPanel chartData={chartData} />
              </div>



              {/* FEEDBACK SECTION */}
              <ParallaxWrapper depth={0.02} className="w-full liquid-glass p-8 rounded-3xl relative overflow-hidden mb-12 holographic-edge">
                <div className="relative z-10">
                  <Feedback />
                </div>
              </ParallaxWrapper>
            </motion.div>
          </>
        )}
      </div>

      <HowToUseModal open={showGuide} onOpenChange={setShowGuide} />
    </DashboardLayout>
  );
}
