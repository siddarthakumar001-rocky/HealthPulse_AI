import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { phcService, PHCFacility } from "@/services/phcService";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  MapPin,
  Pill,
  Radio,
  Server,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

interface DigitalTwinDrawerProps {
  phcId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalTwinDrawer({ phcId, isOpen, onClose }: DigitalTwinDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (phcId && isOpen) {
      fetchDigitalTwin(phcId);
    }
  }, [phcId, isOpen]);

  const fetchDigitalTwin = async (id: string) => {
    try {
      setLoading(true);
      const res: any = await phcService.getDigitalTwin(id);
      if (res?.data?.digitalTwin) {
        setData(res.data.digitalTwin);
      }
    } catch (e) {
      console.error("Failed to load digital twin:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const facility: PHCFacility = data?.identity;
  const healthScore = data?.healthScore;
  const inventory = data?.inventorySummary;
  const footfall = data?.patientFootfallSummary;
  const equipment = data?.equipmentSummary;
  const alerts = data?.recentAlerts || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[rgb(8,14,28)] border border-cyan-500/30 text-white shadow-2xl backdrop-blur-xl">
        <DialogHeader className="border-b border-cyan-500/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                  {facility?.name || "Healthcare Facility"}
                  <Badge
                    variant="outline"
                    className="border-cyan-400/40 text-cyan-300 bg-cyan-950/40 text-xs uppercase"
                  >
                    {facility?.type || "PHC"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  {facility?.district}, {facility?.state} • Code: {facility?.facilityCode}
                </DialogDescription>
              </div>
            </div>

            {/* Connectivity & Health Badge */}
            <div className="flex items-center gap-2">
              <Badge
                className={
                  facility?.connectivity?.isOnline
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }
              >
                {facility?.connectivity?.isOnline ? (
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" /> Offline ({facility?.connectivity?.pendingSyncRecords} queued)
                  </span>
                )}
              </Badge>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">
                  Health: {healthScore?.score || facility?.networkHealthScore || 85}/100
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center text-cyan-400 flex flex-col items-center justify-center gap-3">
            <Activity className="h-8 w-8 animate-spin" />
            <p className="text-sm">Synchronizing Digital Twin Telemetry...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Top Score Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Medicine Stock</p>
                <p className="text-base font-bold text-cyan-400">{healthScore?.subScores?.medicineAvailability || 88}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Bed Occupancy</p>
                <p className="text-base font-bold text-indigo-400">
                  {facility?.occupiedBeds}/{facility?.bedCapacity} beds
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Staff on Duty</p>
                <p className="text-base font-bold text-emerald-400">
                  {facility?.staffOnDuty}/{facility?.staffCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Equipment Uptime</p>
                <p className="text-base font-bold text-teal-400">
                  {equipment?.operationalUnits || 5}/{equipment?.totalUnits || 5}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Cold Chain</p>
                <p className="text-base font-bold text-cyan-300">
                  {inventory?.coldChainStatus === 'Secure' ? '✓ Stable' : '⚠ Warning'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Surge Risk</p>
                <p
                  className={`text-base font-bold ${
                    footfall?.trendRisk === 'High'
                      ? 'text-rose-400'
                      : footfall?.trendRisk === 'Medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {footfall?.trendRisk || 'Low'}
                </p>
              </div>
            </div>

            {/* Tabs for deep dive */}
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="grid grid-cols-4 bg-slate-900/80 border border-slate-800 p-1">
                <TabsTrigger value="inventory" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                  <Pill className="h-3.5 w-3.5 mr-1.5" /> Medicine Stock
                </TabsTrigger>
                <TabsTrigger value="footfall" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Patient Load
                </TabsTrigger>
                <TabsTrigger value="equipment" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                  <Server className="h-3.5 w-3.5 mr-1.5" /> Assets & IoT
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Alerts ({alerts.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Inventory */}
              <TabsContent value="inventory" className="space-y-3 mt-3">
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Medicine / Vaccine</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Stock vs Safe Buffer</th>
                        <th className="p-2.5">Temp / Cold Chain</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {inventory?.items?.map((item: any) => (
                        <tr key={item._id} className="hover:bg-cyan-950/20">
                          <td className="p-2.5 font-medium text-slate-200">
                            {item.medicineName}
                            <span className="block text-[10px] text-slate-500 font-mono">#{item.batchNumber}</span>
                          </td>
                          <td className="p-2.5 text-slate-400">{item.category}</td>
                          <td className="p-2.5">
                            <span className="font-semibold text-cyan-300">{item.quantity} {item.unit}</span>
                            <span className="text-slate-500 text-[10px]"> (min {item.safeBufferThreshold})</span>
                          </td>
                          <td className="p-2.5">
                            {item.coldChainRequired ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-cyan-500/20 text-cyan-300"
                                }`}
                              >
                                ❄ {item.storageTemperature}°C
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Ambient ({item.storageTemperature}°C)</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <Badge
                              variant="outline"
                              className={
                                item.stockHealth === "Critical"
                                  ? "border-rose-500 text-rose-400 bg-rose-950/30"
                                  : item.stockHealth === "Low"
                                  ? "border-amber-500 text-amber-400 bg-amber-950/30"
                                  : "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                              }
                            >
                              {item.stockHealth}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Tab 2: Footfall & Triage */}
              <TabsContent value="footfall" className="space-y-4 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Daily Patient Footfall</p>
                    <p className="text-2xl font-bold text-cyan-300 mt-1">{footfall?.today || 120}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Avg waiting time: ~25 mins</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="text-xs text-slate-400">7-Day Projected Load</p>
                    <p className="text-2xl font-bold text-indigo-300 mt-1">{footfall?.sevenDayAvg || 135} /day</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5">Forecast confidence: 89%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Bed Occupancy Rate</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      {Math.round(((facility?.occupiedBeds || 12) / (facility?.bedCapacity || 20)) * 100)}%
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {facility?.availableBeds || 8} beds currently available
                    </p>
                  </div>
                </div>

                {/* Outbreak Signals */}
                {footfall?.outbreakSignals && footfall.outbreakSignals.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                      <Flame className="h-4 w-4" /> Potential Disease Surge Signal
                    </div>
                    {footfall.outbreakSignals.map((sig: any, idx: number) => (
                      <p key={idx} className="text-xs text-slate-300 mt-1">
                        • <strong className="text-rose-300">{sig.signalName}:</strong> {sig.currentRate}/week (+{sig.percentageDeviation}% above baseline). AI Confidence: {sig.confidence}%.
                      </p>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Equipment */}
              <TabsContent value="equipment" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipment?.items?.map((eq: any) => (
                    <div key={eq._id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{eq.equipmentName}</p>
                        <p className="text-[11px] text-slate-400">ID: {eq.equipmentId} • {eq.usageHours}h usage</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          eq.status === "Operational"
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-950/30"
                            : "border-amber-500/50 text-amber-400 bg-amber-950/30"
                        }
                      >
                        {eq.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 4: Alerts */}
              <TabsContent value="alerts" className="space-y-2 mt-3">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    No active emergency alerts for this facility.
                  </div>
                ) : (
                  alerts.map((al: any) => (
                    <div key={al._id} className="p-3 rounded-lg bg-slate-900/80 border border-rose-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300">{al.title}</span>
                        <Badge variant="destructive" className="text-[10px]">
                          {al.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">{al.description}</p>
                      {al.recommendedAction && (
                        <p className="text-[11px] text-cyan-300 font-mono">
                          ↳ AI Action: {al.recommendedAction}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
