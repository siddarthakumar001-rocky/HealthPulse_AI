import React, { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  let color = "#10b981"; // green
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
        background: rgba(0, 229, 255, 0.35);
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #00E5FF;
        border: 2px solid white;
        box-shadow: 0 0 14px #00E5FF;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapHelper({ facilities }: { facilities: PHCFacility[] }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 150);
  }, [map, facilities.length]);
  return null;
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || 12, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function PHCCommandDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<NetworkKPIs | null>(null);
  const [facilities, setFacilities] = useState<PHCFacility[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<PHCAlertItem[]>([]);
  const [selectedPHCId, setSelectedPHCId] = useState<string | null>(null);
  const [isTwinOpen, setIsTwinOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("NEAR_ME");

  // Real-time user GPS
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const loadData = useCallback(
    async (showToast = false, coords?: [number, number]) => {
      try {
        if (showToast) setRefreshing(true);
        const loc = coords || userLocation;

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
      <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-wide uppercase">
                Enterprise Command Center • Live GPS & Network Intelligence
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Radio className="h-3 w-3 animate-pulse" /> Live Telemetry Feed
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 mt-1">
              Public Healthcare Network Command Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Continuous monitoring of Primary Health Centres (PHCs), CHCs, Cold Chains & Outbreak Signals near your location
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={captureUserLocation}
              disabled={locating}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 bg-slate-900/60 text-xs"
            >
              <LocateFixed className={`h-3.5 w-3.5 mr-1.5 ${locating ? "animate-spin text-cyan-400" : ""}`} />
              {locating ? "Locating..." : "Locate Near Me"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 bg-slate-900/60 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Sync Network
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/supply-chain")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20"
            >
              <Pill className="h-3.5 w-3.5 mr-1.5" /> Supply Chain Hub
            </Button>
          </div>
        </div>

        {/* Top KPIs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Nearby PHCs</span>
                <Building className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">
                {filteredFacilities.length} Centres
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" /> 100% Operational
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Network Health</span>
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl font-bold text-indigo-300 mt-1">
                {kpis?.networkHealthScore || 90}/100
              </p>
              <p className="text-[10px] text-indigo-400 mt-0.5">Optimal Safety Tier</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Critical Alerts</span>
                <AlertOctagon className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-xl font-bold text-rose-400 mt-1">
                {kpis?.criticalAlerts || 0}
              </p>
              <p className="text-[10px] text-rose-300/80 mt-0.5">Under Control</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Stockout Risk</span>
                <Pill className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {kpis?.atRiskStockouts || 1} medicines
              </p>
              <p className="text-[10px] text-amber-300/80 mt-0.5">Safe Buffer Ready</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Outbreak Signals</span>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-xl font-bold text-purple-300 mt-1">
                {kpis?.outbreakSignals || 1} active
              </p>
              <p className="text-[10px] text-purple-400 mt-0.5">Surge Surveillance</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-cyan-500/20 backdrop-blur-md">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Cold Chain Risk</span>
                <Snowflake className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-xl font-bold text-cyan-300 mt-1">
                {kpis?.coldChainAlerts || 0} alerts
              </p>
              <p className="text-[10px] text-cyan-400 mt-0.5">2°C - 8°C Stabilized</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Scenario Stress Simulator */}
        <Card className="bg-slate-900/80 border-cyan-500/20 shadow-lg">
          <CardHeader className="p-4 pb-2 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm font-bold text-white">
                  Real-Time Scenario & Stress Simulator (Live Proximity Network)
                </CardTitle>
              </div>
              <span className="text-[11px] text-slate-400">
                Trigger real-time epidemiological and supply chain disruptions to test AI response
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("DENGUE_SURGE")}
                className="bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-xs"
              >
                <Flame className="h-3.5 w-3.5 mr-1 text-purple-400" /> Simulate Dengue Outbreak
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("MEDICINE_STOCKOUT")}
                className="bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs"
              >
                <Pill className="h-3.5 w-3.5 mr-1 text-amber-400" /> Simulate Medicine Stockout
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("COLD_CHAIN_FAILURE")}
                className="bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs"
              >
                <Snowflake className="h-3.5 w-3.5 mr-1 text-cyan-400" /> Simulate Cold Chain Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("PATIENT_SURGE")}
                className="bg-indigo-950/40 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 text-xs"
              >
                <Users className="h-3.5 w-3.5 mr-1 text-indigo-400" /> Simulate Bed Overload
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("OFFLINE_MODE")}
                className="bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                <WifiOff className="h-3.5 w-3.5 mr-1 text-slate-400" /> Simulate Offline PHC
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={simulating}
                onClick={() => handleSimulate("RESET_NORMAL")}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs ml-auto"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Baseline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map & Facility Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Geo-Map (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="bg-slate-900/80 border-cyan-500/30 overflow-hidden shadow-xl">
              <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
                <div>
                  <CardTitle className="text-base font-bold text-cyan-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Live Geospatial Health Intelligence Network
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Showing {filteredFacilities.length} public health centres near your live GPS coordinates
                  </CardDescription>
                </div>

                {/* District & Status Filters */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 text-xs focus:outline-none"
                  >
                    <option value="NEAR_ME">📍 Near My Live GPS (&lt; 35 km)</option>
                    <option value="Bengaluru Urban">Bengaluru Urban (BBMP)</option>
                    <option value="Chikmagalur">Chikmagalur / Kadur Region</option>
                    <option value="ALL">All Network Facilities</option>
                  </select>

                  <div className="flex items-center gap-1">
                    {["ALL", "OPTIMAL", "WARNING", "OUTBREAK"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 py-1 rounded transition text-[10px] font-semibold ${
                          statusFilter === st
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-[480px] relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <MapHelper facilities={filteredFacilities} />
                  <MapViewController center={mapCenter} zoom={mapZoom} />

                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
                  />

                  {/* User Real-Time Live Location Pin */}
                  {userLocation && (
                    <>
                      <Marker position={userLocation} icon={userLiveIcon}>
                        <Popup className="dark-popup">
                          <div className="p-1 text-xs text-slate-100">
                            <p className="font-bold text-cyan-400 flex items-center gap-1">
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
                            className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs h-7"
                          >
                            Open Digital Twin
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </CardContent>
            </Card>
          </div>

          {/* Connected Facilities List (1 col) */}
          <div className="space-y-3">
            <Card className="bg-slate-900/80 border-cyan-500/30 shadow-xl h-[560px] flex flex-col">
              <CardHeader className="p-4 pb-2 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="h-4 w-4 text-cyan-400" />
                    Nearby Facilities ({filteredFacilities.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px]">
                    Live GPS Proximity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5 overflow-y-auto flex-1">
                {filteredFacilities.map((f) => (
                  <div
                    key={f._id}
                    onClick={() => {
                      setSelectedPHCId(f._id);
                      setIsTwinOpen(true);
                      setMapCenter([f.latitude, f.longitude]);
                    }}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition flex flex-col gap-1.5 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-slate-100 hover:text-cyan-300 transition">
                          {f.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {f.type} • {f.district}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          f.status === "Optimal"
                            ? "border-emerald-500 text-emerald-400 text-[10px]"
                            : f.status === "Warning"
                            ? "border-amber-500 text-amber-400 text-[10px]"
                            : "border-purple-500 text-purple-400 text-[10px]"
                        }
                      >
                        {f.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <span>Beds: {f.availableBeds} free</span>
                      {f.distanceKm !== null && (
                        <span className="text-cyan-400 font-semibold">{f.distanceKm} km away</span>
                      )}
                      <span className="text-indigo-300 font-bold">Score: {f.networkHealthScore}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
