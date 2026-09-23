import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  phcService,
  InventoryItem,
  PHCFacility,
  RedistributionRec,
  ActiveTransfer,
} from "@/services/phcService";
import { toast } from "sonner";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  MoveRight,
  PackageCheck,
  Pill,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Thermometer,
  Truck,
  Zap,
} from "lucide-react";

export default function SmartSupplyChain() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [facilities, setFacilities] = useState<PHCFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  // Redistribution state
  const [aiRecs, setAiRecs] = useState<RedistributionRec[]>([]);
  const [activeTransfers, setActiveTransfers] = useState<ActiveTransfer[]>([]);
  const [selectedRec, setSelectedRec] = useState<RedistributionRec | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, facRes, redRes] = await Promise.all([
        phcService.getInventory(),
        phcService.getFacilities(),
        phcService.getRedistributionRecommendations()
      ]);

      if (invRes?.data) setInventory(invRes.data);
      if (facRes?.data) setFacilities(facRes.data);
      if (redRes?.data) {
        setAiRecs(redRes.data.aiRecommendations || []);
        setActiveTransfers(redRes.data.activeTransfers || []);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load supply chain data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveRec = async (rec: RedistributionRec) => {
    try {
      setApproving(true);
      await phcService.createTransfer({
        sourcePHCId: rec.sourcePHC._id,
        targetPHCId: rec.targetPHC._id,
        resourceName: rec.resourceName,
        quantity: rec.transferQuantity,
        urgencyLevel: rec.urgencyLevel,
        distanceKm: rec.distanceKm,
        aiScore: rec.aiScore,
        aiReasoning: rec.reasoning
      });
      toast.success(`Inter-Facility Transfer Approved: ${rec.transferQuantity} ${rec.unit} of ${rec.resourceName} dispatched.`);
      setTransferModalOpen(false);
      await loadData();
    } catch (e: any) {
      toast.error(`Approval failed: ${e.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleUpdateTransferStatus = async (transferId: string, action: 'APPROVE' | 'DISPATCH' | 'RECEIVE') => {
    try {
      await phcService.approveTransfer(transferId, { action, approvedBy: 'Chief Health Officer' });
      toast.success(`Transfer status updated to ${action}`);
      await loadData();
    } catch (e: any) {
      toast.error(`Action failed: ${e.message}`);
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesFacility =
      selectedFacility === "ALL" ||
      (typeof item.phcId === "object" && item.phcId?._id === selectedFacility) ||
      item.phcId === selectedFacility;

    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.phcId === "object" && item.phcId?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;

    return matchesFacility && matchesSearch && matchesCategory;
  });

  const coldChainItems = inventory.filter((i) => i.coldChainRequired);
  const nearExpiryItems = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 90 && days > 0;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-wide uppercase">
                IoT Supply Chain Network
              </span>
              <span className="text-xs text-slate-400">
                • {inventory.length} Stock Batches Monitored
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 mt-1">
              Smart Inventory & Inter-PHC Redistribution
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              IoT-enabled medicine weights, cold-chain temperature telemetry, stockout forecasting, and automated rebalance
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 bg-slate-900/60 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
        </div>

        {/* AI Redistribution Top Matchmaker Callout */}
        {aiRecs.length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/60 border border-indigo-500/40 shadow-xl">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      AI Resource Redistribution Recommendations
                      <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px]">
                        {aiRecs.length} Opportunities Detected
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-[11px] text-slate-400">
                      AI identified deficit healthcare centres and matched nearest surplus facilities with optimal logistics
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiRecs.slice(0, 3).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/70 border border-indigo-500/30 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Deficit: {rec.targetPHC?.name}
                        </span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                          AI Match {rec.aiScore}%
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 my-2 py-1.5 px-2 rounded bg-slate-900/90 border border-slate-800 text-xs">
                        <div className="flex-1 truncate">
                          <span className="block text-[10px] text-slate-500 uppercase">Donor Facility</span>
                          <span className="font-semibold text-slate-200 truncate">{rec.sourcePHC?.name}</span>
                        </div>
                        <MoveRight className="h-4 w-4 text-cyan-400 shrink-0" />
                        <div className="flex-1 truncate text-right">
                          <span className="block text-[10px] text-slate-500 uppercase">Transfer Qty</span>
                          <span className="font-bold text-cyan-300">{rec.transferQuantity} {rec.unit}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium">{rec.resourceName}</p>
                      <p className="text-[10px] text-slate-400">
                        Distance: <strong>{rec.distanceKm} km</strong> (~{rec.transportTimeEst}) • Donor surplus: {rec.surplusAvailable}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRec(rec);
                        setTransferModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-bold text-xs h-7 mt-1"
                    >
                      <Truck className="h-3 w-3 mr-1" /> Review & Authorize Transfer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Supply Chain Tabs */}
        <Tabs defaultValue="all-inventory" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-slate-900 border border-slate-800 p-1">
              <TabsTrigger value="all-inventory" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                <Boxes className="h-3.5 w-3.5 mr-1.5" /> All Inventory ({inventory.length})
              </TabsTrigger>
              <TabsTrigger value="cold-chain" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                <Snowflake className="h-3.5 w-3.5 mr-1.5" /> Cold Chain ({coldChainItems.length})
              </TabsTrigger>
              <TabsTrigger value="expiry-radar" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                <Clock className="h-3.5 w-3.5 mr-1.5" /> Expiry Radar ({nearExpiryItems.length})
              </TabsTrigger>
              <TabsTrigger value="transfers" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
                <Truck className="h-3.5 w-3.5 mr-1.5" /> Active Transfers ({activeTransfers.length})
              </TabsTrigger>
            </TabsList>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search medicine or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-slate-900/80 border-slate-800 text-xs h-8 w-48 text-white"
                />
              </div>

              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 h-8"
              >
                <option value="ALL">All Facilities</option>
                {facilities.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.facilityCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab 1: All Inventory */}
          <TabsContent value="all-inventory" className="mt-4">
            <Card className="bg-slate-900/80 border-cyan-500/30 shadow-xl overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Medicine / Vaccine</th>
                      <th className="p-3">Facility</th>
                      <th className="p-3">Current Stock vs Buffer</th>
                      <th className="p-3">Daily Burn</th>
                      <th className="p-3">Estimated Stockout</th>
                      <th className="p-3">Cold Chain</th>
                      <th className="p-3">Stock Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredInventory.map((item) => {
                      const fac = typeof item.phcId === "object" ? item.phcId : null;
                      return (
                        <tr key={item._id} className="hover:bg-cyan-950/20 transition">
                          <td className="p-3 font-semibold text-slate-200">
                            {item.medicineName}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>Batch: {item.batchNumber}</span>
                              <span>• Cat: {item.category}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-300">
                            {fac?.name || "PHC"}
                            <span className="block text-[10px] text-slate-500">{fac?.district}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white text-sm">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Safe Buffer: {item.safeBufferThreshold} {item.unit}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            {item.dailyBurnRate} {item.unit}/day
                            {item.aiPrediction?.surgeFactorApplied && item.aiPrediction.surgeFactorApplied > 1 && (
                              <span className="text-[10px] text-purple-400 block font-mono">
                                Surge: {item.aiPrediction.surgeFactorApplied}×
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-indigo-300">
                              {item.aiPrediction?.estimatedDepletionWindow || item.estimatedDepletionDate || "Safe (>30d)"}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Confidence: {item.aiPrediction?.confidence || item.confidenceScore || 90}%
                            </span>
                          </td>
                          <td className="p-3">
                            {item.coldChainRequired ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono inline-flex items-center gap-1 ${
                                  item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-cyan-500/20 text-cyan-300"
                                }`}
                              >
                                <Snowflake className="h-2.5 w-2.5" /> {item.storageTemperature}°C
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Ambient ({item.storageTemperature}°C)</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={
                                item.stockHealth === "Critical"
                                  ? "border-rose-500 text-rose-400 bg-rose-950/30 text-[10px]"
                                  : item.stockHealth === "Low"
                                  ? "border-amber-500 text-amber-400 bg-amber-950/30 text-[10px]"
                                  : item.stockHealth === "Excess"
                                  ? "border-blue-500 text-blue-400 bg-blue-950/30 text-[10px]"
                                  : "border-emerald-500 text-emerald-400 bg-emerald-950/30 text-[10px]"
                              }
                            >
                              {item.stockHealth}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Cold Chain Monitoring */}
          <TabsContent value="cold-chain" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coldChainItems.map((item) => {
                const isBreach = item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature;
                const fac = typeof item.phcId === "object" ? item.phcId : null;
                return (
                  <Card
                    key={item._id}
                    className={`bg-slate-900/80 border ${
                      isBreach ? "border-rose-500/50 bg-rose-950/10" : "border-cyan-500/30"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            isBreach
                              ? "border-rose-500 text-rose-400 bg-rose-950/30 text-[10px]"
                              : "border-cyan-500 text-cyan-300 bg-cyan-950/30 text-[10px]"
                          }
                        >
                          {isBreach ? "🚨 TEMPERATURE BREACH" : "✓ COLD CHAIN SECURE"}
                        </Badge>
                        <span className="text-xs text-slate-400">{fac?.name}</span>
                      </div>
                      <CardTitle className="text-sm font-bold text-white mt-1">
                        {item.medicineName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Live Sensor Telemetry</span>
                          <p className={`text-xl font-mono font-bold ${isBreach ? "text-rose-400" : "text-cyan-300"}`}>
                            {item.storageTemperature}°C
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase">Safe Window</span>
                          <p className="text-xs font-mono text-slate-300">
                            {item.minTemperature}°C – {item.maxTemperature}°C
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Quantity: <strong>{item.quantity} {item.unit}</strong></span>
                        <span>Batch: <strong>{item.batchNumber}</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab 3: Expiry Radar */}
          <TabsContent value="expiry-radar" className="mt-4">
            <Card className="bg-slate-900/80 border-cyan-500/30">
              <CardHeader className="p-4 pb-2 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Medicines & Vaccines Nearing Expiry (Within 90 Days)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Surplus stock approaching expiration should be redistributed to high-volume centres to prevent wastage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Medicine</th>
                      <th className="p-3">Facility</th>
                      <th className="p-3">Batch Number</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3">Days Remaining</th>
                      <th className="p-3 text-right">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {nearExpiryItems.map((item) => {
                      const fac = typeof item.phcId === "object" ? item.phcId : null;
                      const daysLeft = Math.round(
                        (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <tr key={item._id} className="hover:bg-cyan-950/20">
                          <td className="p-3 font-semibold text-slate-200">{item.medicineName}</td>
                          <td className="p-3 text-slate-300">{fac?.name}</td>
                          <td className="p-3 font-mono text-slate-400">{item.batchNumber}</td>
                          <td className="p-3 font-bold text-cyan-300">{item.quantity} {item.unit}</td>
                          <td className="p-3 text-slate-300">{new Date(item.expiryDate).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-amber-400">{daysLeft} days</td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info(`AI Transfer scheduled for batch #${item.batchNumber}`)}
                              className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 text-xs h-7"
                            >
                              Redistribute Batch
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Active Inter-Facility Transfers */}
          <TabsContent value="transfers" className="mt-4">
            <Card className="bg-slate-900/80 border-cyan-500/30">
              <CardHeader className="p-4 pb-2 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  Inter-Facility Resource Transfers Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {activeTransfers.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No active inter-facility stock transfers currently in progress.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Resource</th>
                        <th className="p-3">Source (Donor)</th>
                        <th className="p-3">Target (Deficit)</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {activeTransfers.map((tr) => (
                        <tr key={tr._id} className="hover:bg-cyan-950/20">
                          <td className="p-3 font-semibold text-slate-200">{tr.resourceName}</td>
                          <td className="p-3 text-slate-300">{tr.sourcePHC?.name}</td>
                          <td className="p-3 text-cyan-300 font-semibold">{tr.targetPHC?.name}</td>
                          <td className="p-3 font-bold text-white">{tr.quantity} {tr.unit}</td>
                          <td className="p-3 text-slate-400">{tr.distanceKm} km</td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={
                                tr.status === "Completed"
                                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                                  : tr.status === "In Transit"
                                  ? "border-blue-500 text-blue-400 bg-blue-950/30"
                                  : "border-amber-500 text-amber-400 bg-amber-950/30"
                              }
                            >
                              {tr.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {tr.status === "Pending Approval" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "APPROVE")}
                                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs h-7"
                              >
                                Approve
                              </Button>
                            )}
                            {tr.status === "Approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "DISPATCH")}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-7"
                              >
                                Dispatch
                              </Button>
                            )}
                            {tr.status === "In Transit" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "RECEIVE")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7"
                              >
                                Confirm Received
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transfer Review & Authorization Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="max-w-lg bg-[rgb(8,14,28)] border border-cyan-500/30 text-white shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Truck className="h-5 w-5 text-cyan-400" />
              Authorize Inter-Facility Transfer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              AI Recommendation Match Score: {selectedRec?.aiScore}/100
            </DialogDescription>
          </DialogHeader>

          {selectedRec && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Resource:</span>
                  <span className="font-bold text-white text-sm">{selectedRec.resourceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authorized Quantity:</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {selectedRec.transferQuantity} {selectedRec.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Donor Facility:</span>
                  <span className="text-slate-200">{selectedRec.sourcePHC?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Deficit Facility:</span>
                  <span className="text-rose-400 font-semibold">{selectedRec.targetPHC?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Transit Distance / ETA:</span>
                  <span className="text-slate-200 font-mono">
                    {selectedRec.distanceKm} km (~{selectedRec.transportTimeEst})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                ↳ Reasoning: {selectedRec.reasoning}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransferModalOpen(false)}
                  className="text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={approving}
                  onClick={() => handleApproveRec(selectedRec)}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs"
                >
                  {approving ? "Authorizing..." : "Authorize & Dispatch"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
