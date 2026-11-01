import React, { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { phcService, PHCFacility, NetworkKPIs, PHCAlertItem } from "@/services/phcService";
import DigitalTwinDrawer from "@/components/DigitalTwinDrawer";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  Compass,
  Cpu,
  Flame,
  Globe,
  Layers,
  LocateFixed,
  MapPin,
  Navigation,
  Pill,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Leaflet custom marker generator
const createCustomMarker = (status: string) => {
  let color = "#05D3B3"; // teal
  if (status === "Warning") color = "#f59e0b"; // yellow
  else if (status === "Critical") color = "#ef4444"; // red
  else if (status === "Outbreak") color = "#a855f7"; // purple
  else if (status === "Offline") color = "#64748b"; // gray

  return L.divIcon({
    className: "custom-phc-pin",
    html: `
      <div style="
        background: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 16px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        +
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

// User Live Location Marker Icon
const userLiveIcon = L.divIcon({
  className: "user-live-pin",
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 245, 212, 0.4);
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        top: 5px;
        left: 5px;
        border-radius: 50%;
        background: #00F5D4;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px #00F5D4;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Auto-Center Map Helper
function MapHelper({ facilities }: { facilities: PHCFacility[] }) {
  const map = useMap();
  useEffect(() => {
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(facilities.map((f) => [f.latitude, f.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [facilities, map]);
  return null;
}

// Controller to smoothly pan to center coordinates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function PHCCommandDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<PHCFacility[]>([]);
  const [kpis, setKpis] = useState<NetworkKPIs | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<PHCAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Digital Twin Drawer
  const [selectedPHCId, setSelectedPHCId] = useState<string | null>(null);
  const [isTwinOpen, setIsTwinOpen] = useState(false);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("NEAR_ME");

  // Geolocation & Dynamic Map State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bengaluru default
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [locating, setLocating] = useState(false);

  const loadData = useCallback(
    async (showToast = false, loc = userLocation) => {
      try {
        if (showToast) setRefreshing(true);
        const [overviewRes, facRes] = await Promise.all([
          phcService.getNetworkOverview(),
          loc
            ? phcService.getFacilities({ lat: loc[0], lng: loc[1], radius: 35 })
            : phcService.getFacilities(),
        ]);

        if (overviewRes?.data) {
          setKpis(overviewRes.data.kpis);
          setRecentAlerts(overviewRes.data.recentAlerts || []);
        }

        if (facRes?.data) {
          setFacilities(facRes.data);
        } else if (overviewRes?.data?.facilities) {
          setFacilities(overviewRes.data.facilities);
        }

        if (showToast) toast.success("Real-time network telemetry synchronized");
      } catch (e: any) {
        toast.error(e.message || "Failed to load network intelligence data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userLocation]
  );

  // Capture user real-time GPS
  const captureUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.info("Geolocation is not supported, using default view");
      loadData(false);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(12);
        setLocating(false);
        toast.success(`Live GPS locked [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
        loadData(false, coords);
      },
      (err) => {
        console.warn("User geolocation error:", err);
        const fallback: [number, number] = [12.9716, 77.5946];
        setUserLocation(fallback);
        setMapCenter(fallback);
        setLocating(false);
        loadData(false, fallback);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [loadData]);

  useEffect(() => {
    captureUserLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadData(false), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSimulate = async (scenario: string) => {
    try {
      setSimulating(true);
      toast.info(`Executing simulation: ${scenario.replace("_", " ")}...`);
      const res: any = await phcService.triggerSimulation(scenario);
      toast.success(res?.data?.changes?.[0] || `Scenario ${scenario} executed`);
      await loadData(false);
    } catch (e: any) {
      toast.error(`Simulation failed: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  // Facilities with computed distance from user location
  const enrichedFacilities = facilities.map((f) => {
    const dist =
      typeof (f as any).distanceKm === "number"
        ? (f as any).distanceKm
        : userLocation
        ? calculateDistance(userLocation[0], userLocation[1], f.latitude, f.longitude)
        : null;
    return { ...f, distanceKm: dist };
  });

  // Sort by proximity when GPS is active
  enrichedFacilities.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  const filteredFacilities = enrichedFacilities.filter((f) => {
    const matchesStatus = statusFilter === "ALL" || f.status.toUpperCase() === statusFilter;
    const matchesDistrict =
      districtFilter === "ALL"
        ? true
        : districtFilter === "NEAR_ME"
        ? (f.distanceKm !== null ? f.distanceKm <= 35 : true)
        : f.district.toLowerCase().includes(districtFilter.toLowerCase()) ||
          districtFilter.toLowerCase().includes(f.district.toLowerCase());
    return matchesStatus && matchesDistrict;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 max-w-7xl mx-auto">
        
        {/* ── HEADER STRIP (ANTIGRAVITY MEDICAL GLASS) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="mermaid-chip text-[11px] font-bold">
                <Globe className="h-3.5 w-3.5 text-[#05D3B3]" />
                {t("phc.enterpriseCommandCenter", "Enterprise Command Center • Live GPS & Network Intelligence")}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#05D3B3] font-mono">
                <Radio className="h-3 w-3 animate-pulse" /> {t("phc.liveTelemetryFeed", "Live Telemetry Feed")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {t("phc.commandHubTitle", "Public Healthcare Network Command Hub")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t("phc.commandHubSubtitle", "Continuous monitoring of Primary Health Centres (PHCs), CHCs, Cold Chains & Outbreak Signals near your location")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={captureUserLocation}
              disabled={locating}
              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
            >
              <LocateFixed className={`h-3.5 w-3.5 mr-1.5 ${locating ? "animate-spin text-[#05D3B3]" : ""}`} />
              {locating ? t("phc.locating", "Locating...") : t("phc.locateNearMe", "Locate Near Me")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              {t("phc.syncNetwork", "Sync Network")}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/phc-supply-chain")}
              className="mermaid-btn text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-2xl shadow-sm"
            >
              <Pill className="h-3.5 w-3.5 mr-1.5" /> {t("phc.supplyChainHub", "Supply Chain Hub")}
            </Button>
          </div>
        </div>

        {/* ── TOP KPIS BENTO BANNER (MERMAID GLASS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.nearbyPHCs", "Nearby PHCs")}</span>
              <Building className="h-4 w-4 text-[#05D3B3]" />
            </div>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {filteredFacilities.length} <span className="text-xs font-normal text-muted-foreground font-sans">{t("phc.centres", "Centres")}</span>
            </p>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 pt-0.5 font-mono">
              <CheckCircle2 className="h-3 w-3" /> {t("phc.operational100", "100% Operational")}
            </p>
          </div>

          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.networkHealth", "Network Health")}</span>
              <ShieldCheck className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-2xl font-black font-mono text-teal-600 dark:text-teal-300 mt-1">
              {kpis?.networkHealthScore || 90}/100
            </p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold pt-0.5 font-mono">
              {t("phc.optimalSafetyTier", "Optimal Safety Tier")}
            </p>
          </div>

          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.criticalAlerts", "Critical Alerts")}</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black font-mono text-rose-500 mt-1">
              {kpis?.criticalAlerts || 0}
            </p>
            <p className="text-[10px] text-rose-400 font-bold pt-0.5 font-mono">
              {t("phc.underControl", "Under Control")}
            </p>
          </div>

          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.stockoutRisk", "Stockout Risk")}</span>
              <Pill className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black font-mono text-amber-500 mt-1">
              {kpis?.atRiskStockouts || 1} <span className="text-xs font-normal text-muted-foreground font-sans">{t("phc.medicines", "medicines")}</span>
            </p>
            <p className="text-[10px] text-amber-500 font-bold pt-0.5 font-mono">
              {t("phc.safeBufferReady", "Safe Buffer Ready")}
            </p>
          </div>

          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.outbreakSignals", "Outbreak Signals")}</span>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black font-mono text-purple-400 mt-1">
              {kpis?.outbreakSignals || 1} <span className="text-xs font-normal text-muted-foreground font-sans">{t("phc.activeSurveillance", "active")}</span>
            </p>
            <p className="text-[10px] text-purple-400 font-bold pt-0.5 font-mono">
              {t("phc.activeSurveillance", "Surge Surveillance")}
            </p>
          </div>

          <div className="mermaid-glass p-4 rounded-3xl border border-teal-500/20 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.coldChainRisk", "Cold Chain Risk")}</span>
              <Snowflake className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black font-mono text-cyan-400 mt-1">
              {kpis?.coldChainAlerts || 0} <span className="text-xs font-normal text-muted-foreground font-sans">{t("phc.alerts", "alerts")}</span>
            </p>
            <p className="text-[10px] text-cyan-400 font-bold pt-0.5 font-mono">
              {t("phc.tempStabilized", "2°C - 8°C Stabilized")}
            </p>
          </div>
        </div>

        {/* ── REAL-TIME SCENARIO STRESS SIMULATOR (ANTIGRAVITY GLASS) ── */}
        <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30 text-[#05D3B3]">
                <Cpu className="h-4 w-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-foreground">
                {t("phc.stressSimulatorTitle", "Real-Time Scenario & Stress Simulator (Live Proximity Network)")}
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              {t("phc.stressSimulatorSubtitle", "Trigger real-time epidemiological and supply chain disruptions to test AI response")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("DENGUE_SURGE")}
              className="rounded-2xl border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold h-9 shadow-sm"
            >
              <Flame className="h-3.5 w-3.5 mr-1.5 text-purple-400" /> {t("phc.simDengue", "Simulate Dengue Outbreak")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("MEDICINE_STOCKOUT")}
              className="rounded-2xl border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold h-9 shadow-sm"
            >
              <Pill className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> {t("phc.simStockout", "Simulate Medicine Stockout")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("COLD_CHAIN_FAILURE")}
              className="rounded-2xl border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold h-9 shadow-sm"
            >
              <Snowflake className="h-3.5 w-3.5 mr-1.5 text-cyan-400" /> {t("phc.simColdChain", "Simulate Cold Chain Alert")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("PATIENT_SURGE")}
              className="rounded-2xl border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-xs font-bold h-9 shadow-sm"
            >
              <Users className="h-3.5 w-3.5 mr-1.5 text-teal-400" /> {t("phc.simBedOverload", "Simulate Bed Overload")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("OFFLINE_FACILITY")}
              className="rounded-2xl border-slate-500/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 text-xs font-bold h-9 shadow-sm"
            >
              <WifiOff className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {t("phc.simOfflinePHC", "Simulate Offline PHC")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={simulating}
              onClick={() => handleSimulate("RESET_BASELINE")}
              className="rounded-2xl text-muted-foreground hover:text-foreground text-xs font-bold h-9"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> {t("phc.resetBaseline", "Reset Baseline")}
            </Button>
          </div>
        </div>

        {/* ── MAP & FACILITY MATRIX GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Geo-Map (2 cols) */}
          <div className="lg:col-span-2">
            <div className="mermaid-glass rounded-[2rem] border border-teal-500/20 shadow-xl overflow-hidden flex flex-col">
              
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-500/15">
                <div>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#05D3B3]" />
                    {t("phc.geospatialNetwork", "Live Geospatial Health Intelligence Network")}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {t("phc.showingCentresNearGps", "Showing public health centres near your live GPS coordinates")}
                  </p>
                </div>

                {/* District & Status Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="antigravity-input bg-card/80 border border-teal-500/30 rounded-2xl px-3 text-xs font-semibold h-9 text-foreground shadow-sm"
                  >
                    <option value="NEAR_ME" className="bg-slate-900 text-white">📍 {t("phc.nearMyLiveGps", "Near My Live GPS (< 35 km)")}</option>
                    <option value="Bengaluru Urban" className="bg-slate-900 text-white">Bengaluru Urban (BBMP)</option>
                    <option value="Chikmagalur" className="bg-slate-900 text-white">Chikmagalur / Kadur Region</option>
                    <option value="ALL" className="bg-slate-900 text-white">{t("phc.allDistricts", "All Districts (Karnataka)")}</option>
                  </select>

                  <div className="flex items-center gap-1 bg-card/80 p-1 rounded-2xl border border-teal-500/20">
                    {["ALL", "OPTIMAL", "WARNING", "OUTBREAK"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-xl transition text-[10px] font-extrabold ${
                          statusFilter === st
                            ? "bg-[#05D3B3] text-slate-950 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[460px] relative w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <MapHelper facilities={filteredFacilities} />
                  <MapViewController center={mapCenter} zoom={mapZoom} />

                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                  />

                  {/* User Real-Time Live Location Pin */}
                  {userLocation && (
                    <>
                      <Marker position={userLocation} icon={userLiveIcon}>
                        <Popup className="dark-popup">
                          <div className="p-1 text-xs text-slate-100">
                            <p className="font-bold text-[#00F5D4] flex items-center gap-1">
                              <LocateFixed className="h-3 w-3" /> Your Real-Time GPS Location
                            </p>
                            <p className="text-[11px] text-slate-300 mt-1">
                              Lat: {userLocation[0].toFixed(4)}, Lon: {userLocation[1].toFixed(4)}
                            </p>
                            <p className="text-[10px] text-emerald-400 mt-0.5">Live Proximity Radar Active</p>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={userLocation}
                        radius={5000}
                        pathOptions={{
                          color: "#00E5FF",
                          fillColor: "#00E5FF",
                          fillOpacity: 0.08,
                          weight: 1,
                        }}
                      />
                    </>
                  )}

                  {/* PHC Facilities Markers */}
                  {filteredFacilities.map((facility) => (
                    <Marker
                      key={facility._id}
                      position={[facility.latitude, facility.longitude]}
                      icon={createCustomMarker(facility.status)}
                      eventHandlers={{
                        click: () => {
                          setSelectedPHCId(facility._id);
                          setIsTwinOpen(true);
                        },
                      }}
                    >
                      <Popup className="dark-popup">
                        <div className="p-2 space-y-1.5 text-xs text-slate-100 min-w-[220px]">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                            <span className="font-bold text-cyan-300">{facility.name}</span>
                            <Badge
                              variant="outline"
                              className={
                                facility.status === "Optimal"
                                  ? "border-emerald-500 text-emerald-400 text-[10px]"
                                  : facility.status === "Warning"
                                  ? "border-amber-500 text-amber-400 text-[10px]"
                                  : "border-purple-500 text-purple-400 text-[10px]"
                              }
                            >
                              {facility.status}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-slate-300">
                            {facility.type} • {facility.district}, Karnataka
                          </p>

                          {facility.distanceKm !== null && (
                            <p className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                              <Compass className="h-3 w-3" /> {facility.distanceKm} km from your location
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-300 font-mono">
                            <div>Beds: {facility.occupiedBeds}/{facility.bedCapacity}</div>
                            <div>Staff: {facility.staffOnDuty}/{facility.staffCount}</div>
                            <div>Med Score: {facility.subScores?.medicineAvailability}%</div>
                            <div>Cold Chain: {facility.subScores?.coldChainStability}%</div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPHCId(facility._id);
                              setIsTwinOpen(true);
                            }}
                            className="mermaid-btn w-full mt-2 text-xs font-bold h-7"
                          >
                            Open Digital Twin
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Connected Facilities List (1 col) */}
          <div className="space-y-3">
            <div className="mermaid-glass rounded-[2rem] border border-teal-500/20 shadow-xl h-[545px] flex flex-col p-5">
              <div className="flex items-center justify-between border-b border-teal-500/15 pb-3 mb-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#05D3B3]" />
                  {t("phc.nearbyFacilities", "Nearby Facilities")} ({filteredFacilities.length})
                </h3>
                <span className="mermaid-chip text-[9px] font-bold">
                  Live GPS
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {filteredFacilities.map((f) => (
                  <div
                    key={f._id}
                    onClick={() => {
                      setSelectedPHCId(f._id);
                      setIsTwinOpen(true);
                      setMapCenter([f.latitude, f.longitude]);
                    }}
                    className="p-3.5 rounded-2xl bg-card/60 border border-teal-500/15 hover:border-teal-500/40 cursor-pointer transition flex flex-col gap-1.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-foreground hover:text-[#05D3B3] transition">
                          {f.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {f.type} • {f.district}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          f.status === "Optimal"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold"
                            : f.status === "Warning"
                            ? "border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] font-bold"
                            : "border-purple-500/40 text-purple-400 bg-purple-500/10 text-[10px] font-bold"
                        }
                      >
                        {f.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1.5 border-t border-teal-500/10">
                      <span>{t("phc.beds", "Beds")}: {f.availableBeds} free</span>
                      {f.distanceKm !== null && (
                        <span className="text-[#05D3B3] font-bold">{f.distanceKm} km {t("phc.away", "away")}</span>
                      )}
                      <span className="text-teal-600 dark:text-teal-300 font-bold">Score: {f.networkHealthScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Twin Drawer Modal */}
        <DigitalTwinDrawer
          phcId={selectedPHCId}
          open={isTwinOpen}
          onClose={() => setIsTwinOpen(false)}
          onDataChanged={() => loadData(false)}
        />
      </div>
    </DashboardLayout>
  );
}
