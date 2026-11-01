import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
import { useTranslation } from "react-i18next";
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
  Activity,
  Check
} from "lucide-react";

export default function SmartSupplyChain() {
  const { t } = useTranslation();
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
      toast.error(e.message || "Failed to authorize transfer");
    } finally {
      setApproving(false);
    }
  };

  const handleUpdateTransferStatus = async (transferId: string, action: string) => {
    try {
      await phcService.updateTransferStatus(transferId, action);
      toast.success(`Transfer status updated to ${action}`);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update transfer status");
    }
  };

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
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* ── HEADER STRIP (ANTIGRAVITY MEDICAL GLASS) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="mermaid-chip text-[11px] font-bold">
                <Boxes className="h-3.5 w-3.5 text-[#05D3B3]" />
                {t("phc.iotSupplyChainNetwork", "IoT SUPPLY CHAIN NETWORK")}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                • {inventory.length} {t("phc.stockBatchesMonitored", "Stock Batches Monitored")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {t("phc.supplyChainTitle", "Smart Inventory & Inter-PHC Redistribution")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t("phc.supplyChainSubtitle", "IoT-enabled medicine weights, cold-chain temperature telemetry, stockout forecasting, and automated rebalance")}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("phc.refreshTelemetry", "Refresh Telemetry")}
          </Button>
        </div>

        {/* ── AI REDISTRIBUTION MATCHMAKER CALLOUT (MERMAID GLASS) ── */}
        {aiRecs.length > 0 && (
          <div className="mermaid-glass p-6 sm:p-7 rounded-[2rem] border border-teal-500/25 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-[#05D3B3]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    {t("phc.aiResourceRedistributionRecommendations", "AI Resource Redistribution Recommendations")}
                    <span className="mermaid-chip text-[10px] py-0.5 px-2 font-bold">
                      {aiRecs.length} {t("phc.opportunitiesDetected", "Opportunities Detected")}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("phc.aiDeficitMatchedSubtitle", "AI identified deficit healthcare centres and matched nearest surplus facilities with optimal logistics")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {aiRecs.slice(0, 3).map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-card/60 border border-teal-500/20 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-500 flex items-center gap-1.5 truncate">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t("phc.deficit", "Deficit")}: {rec.targetPHC?.name}</span>
                      </span>
                      <span className="mermaid-chip text-[10px] py-0.5 px-2 text-emerald-400 font-bold shrink-0">
                        AI Match {rec.aiScore}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-card/80 border border-teal-500/15 text-xs font-mono">
                      <div className="flex-1 truncate">
                        <span className="block text-[9px] text-muted-foreground uppercase">{t("phc.donorFacility", "Donor Facility")}</span>
                        <span className="font-bold text-foreground truncate block">{rec.sourcePHC?.name}</span>
                      </div>
                      <MoveRight className="h-4 w-4 text-[#05D3B3] shrink-0" />
                      <div className="flex-1 truncate text-right">
                        <span className="block text-[9px] text-muted-foreground uppercase">{t("phc.transferQty", "Transfer Qty")}</span>
                        <span className="font-black text-[#05D3B3] truncate block">{rec.transferQuantity} {rec.unit}</span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-foreground">{rec.resourceName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {t("phc.distance", "Distance")}: <strong className="text-foreground">{rec.distanceKm} km</strong> (~{rec.transportTimeEst}) • {t("phc.donorSurplus", "Donor surplus")}: {rec.surplusAvailable}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRec(rec);
                      setTransferModalOpen(true);
                    }}
                    className="mermaid-btn w-full text-xs font-bold tracking-wider uppercase h-9 rounded-xl shadow-sm"
                  >
                    <Truck className="h-3.5 w-3.5 mr-1.5" /> {t("phc.reviewAuthorizeTransfer", "Review & Authorize Transfer")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN SUPPLY CHAIN TABS & FILTER TOOLBAR ── */}
        <Tabs defaultValue="all-inventory" className="w-full space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <TabsList className="bg-card/70 border border-teal-500/25 p-1 rounded-2xl h-12 shadow-sm backdrop-blur-xl">
              <TabsTrigger
                value="all-inventory"
                className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-4 flex items-center gap-2 transition-all"
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>{t("phc.allInventoryTab", "All Inventory")} ({inventory.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="cold-chain"
                className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-4 flex items-center gap-2 transition-all"
              >
                <Snowflake className="h-3.5 w-3.5" />
                <span>{t("phc.coldChainTab", "Cold Chain")} ({coldChainItems.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="expiry-radar"
                className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-4 flex items-center gap-2 transition-all"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{t("phc.expiryRadarTab", "Expiry Radar")} ({nearExpiryItems.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="transfers"
                className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-4 flex items-center gap-2 transition-all"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>{t("phc.activeTransfersTab", "Active Transfers")} ({activeTransfers.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Filter Bar with AntiGravity inputs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("phc.searchPlaceholder", "Search medicine or batch...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="antigravity-input pl-9 pr-3 h-10 w-48 sm:w-60 text-xs rounded-2xl bg-card/80 border border-teal-500/30"
                />
              </div>

              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="antigravity-input bg-card/80 border border-teal-500/30 rounded-2xl px-3 text-xs font-semibold h-10 text-foreground shadow-sm"
              >
                <option value="ALL" className="bg-slate-900 text-white">{t("phc.allFacilities", "All Facilities")}</option>
                {facilities.map((f) => (
                  <option key={f._id} value={f._id} className="bg-slate-900 text-white">
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="antigravity-input bg-card/80 border border-teal-500/30 rounded-2xl px-3 text-xs font-semibold h-10 text-foreground shadow-sm"
              >
                <option value="ALL" className="bg-slate-900 text-white">{t("phc.allCategories", "All Categories")}</option>
                {Array.from(new Set(inventory.map((i) => i.category))).map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              TAB 1: ALL INVENTORY (MERMAID GLASS DATA TABLE)
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="all-inventory" className="mt-2">
            <div className="mermaid-glass rounded-[2rem] border border-teal-500/20 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-card/90 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-teal-500/15">
                    <tr>
                      <th className="p-3.5 sm:px-5">{t("phc.tableMedicineVaccine", "Medicine / Vaccine")}</th>
                      <th className="p-3.5">{t("phc.tableFacility", "Facility")}</th>
                      <th className="p-3.5">{t("phc.tableCurrentStockVsBuffer", "Current Stock vs Buffer")}</th>
                      <th className="p-3.5">{t("phc.tableDailyBurn", "Daily Burn")}</th>
                      <th className="p-3.5">{t("phc.tableEstimatedStockout", "Estimated Stockout")}</th>
                      <th className="p-3.5">{t("phc.tableColdChain", "Cold Chain")}</th>
                      <th className="p-3.5 sm:px-5">{t("phc.tableStockHealth", "Stock Health")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-500/10">
                    {filteredInventory.map((item) => {
                      const fac = typeof item.phcId === "object" ? item.phcId : null;
                      return (
                        <tr key={item._id} className="hover:bg-teal-500/10 transition-colors">
                          <td className="p-3.5 sm:px-5 font-bold text-foreground">
                            {item.medicineName}
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                              <span>Batch: {item.batchNumber}</span>
                              <span>• Cat: {item.category}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-foreground">
                            {fac?.name || "PHC"}
                            <span className="block text-[10px] text-muted-foreground font-mono">{fac?.district}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-foreground text-sm font-mono">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              Safe Buffer: {item.safeBufferThreshold} {item.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-foreground font-mono">
                            {item.dailyBurnRate} {item.unit}/day
                            {item.aiPrediction?.surgeFactorApplied && item.aiPrediction.surgeFactorApplied > 1 && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[9px] font-mono">
                                Surge: {item.aiPrediction.surgeFactorApplied}×
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-teal-600 dark:text-teal-300">
                              {item.aiPrediction?.estimatedDepletionWindow || item.estimatedDepletionDate || "Safe (>30d)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              Confidence: {item.aiPrediction?.confidence || item.confidenceScore || 90}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            {item.coldChainRequired ? (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono inline-flex items-center gap-1 ${
                                  item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature
                                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/40"
                                    : "bg-cyan-500/15 text-cyan-400 border border-cyan-400/30"
                                }`}
                              >
                                <Snowflake className="h-3 w-3" /> {item.storageTemperature}°C
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px] font-mono">Ambient ({item.storageTemperature}°C)</span>
                            )}
                          </td>
                          <td className="p-3.5 sm:px-5">
                            <Badge
                              variant="outline"
                              className={
                                item.stockHealth === "Critical"
                                  ? "border-rose-500/40 text-rose-400 bg-rose-500/15 text-[10px] font-bold"
                                  : item.stockHealth === "Low"
                                    ? "border-amber-500/40 text-amber-400 bg-amber-500/15 text-[10px] font-bold"
                                    : item.stockHealth === "Excess"
                                      ? "border-blue-500/40 text-blue-400 bg-blue-500/15 text-[10px] font-bold"
                                      : "border-emerald-500/40 text-emerald-400 bg-emerald-500/15 text-[10px] font-bold"
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
              </div>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════
              TAB 2: COLD CHAIN MONITORING (BENTO SENSORS)
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="cold-chain" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coldChainItems.map((item) => {
                const isBreach = item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature;
                const fac = typeof item.phcId === "object" ? item.phcId : null;
                return (
                  <div
                    key={item._id}
                    className={`mermaid-glass p-5 rounded-3xl border shadow-lg space-y-4 ${
                      isBreach ? "border-rose-500/50 shadow-rose-500/10" : "border-teal-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`mermaid-chip text-[10px] font-bold ${
                          isBreach ? "text-rose-400 border-rose-500/40" : "text-cyan-400"
                        }`}
                      >
                        {isBreach ? "🚨 TEMPERATURE BREACH" : "✓ COLD CHAIN SECURE"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{fac?.name}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-foreground">
                        {item.medicineName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Batch: {item.batchNumber}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-teal-500/15">
                      <div>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase block font-bold">Live Sensor Telemetry</span>
                        <p className={`text-2xl font-black font-mono ${isBreach ? "text-rose-500" : "text-[#05D3B3]"}`}>
                          {item.storageTemperature}°C
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase block font-bold">Safe Window</span>
                        <p className="text-xs font-mono font-bold text-foreground">
                          {item.minTemperature}°C – {item.maxTemperature}°C
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-teal-500/10">
                      <span>Quantity: <strong className="text-foreground">{item.quantity} {item.unit}</strong></span>
                      <span className="font-mono text-teal-600 dark:text-teal-400">IoT Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════
              TAB 3: EXPIRY RADAR (MERMAID GLASS DATA TABLE)
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="expiry-radar" className="mt-2">
            <div className="mermaid-glass rounded-[2rem] border border-teal-500/20 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-teal-500/15 flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Medicines & Vaccines Nearing Expiry (Within 90 Days)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Surplus stock approaching expiration should be redistributed to high-volume centres to prevent wastage
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-card/90 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-teal-500/15">
                    <tr>
                      <th className="p-3.5 sm:px-5">Medicine</th>
                      <th className="p-3.5">Facility</th>
                      <th className="p-3.5">Batch Number</th>
                      <th className="p-3.5">Quantity</th>
                      <th className="p-3.5">Expiry Date</th>
                      <th className="p-3.5">Days Remaining</th>
                      <th className="p-3.5 sm:px-5 text-right">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-500/10">
                    {nearExpiryItems.map((item) => {
                      const fac = typeof item.phcId === "object" ? item.phcId : null;
                      const daysLeft = Math.round(
                        (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <tr key={item._id} className="hover:bg-teal-500/10 transition-colors">
                          <td className="p-3.5 sm:px-5 font-bold text-foreground">{item.medicineName}</td>
                          <td className="p-3.5 text-foreground">{fac?.name}</td>
                          <td className="p-3.5 font-mono text-muted-foreground">{item.batchNumber}</td>
                          <td className="p-3.5 font-bold text-[#05D3B3] font-mono">{item.quantity} {item.unit}</td>
                          <td className="p-3.5 text-foreground font-mono">{new Date(item.expiryDate).toLocaleDateString()}</td>
                          <td className="p-3.5 font-black font-mono text-amber-500">{daysLeft} days</td>
                          <td className="p-3.5 sm:px-5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info(`AI Transfer scheduled for batch #${item.batchNumber}`)}
                              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-xl text-xs h-8 px-3 font-bold shadow-sm"
                            >
                              Redistribute Batch
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════
              TAB 4: ACTIVE TRANSFERS (MERMAID GLASS DATA TABLE)
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="transfers" className="mt-2">
            <div className="mermaid-glass rounded-[2rem] border border-teal-500/20 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-teal-500/15 flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-[#05D3B3]" />
                <h3 className="text-sm font-black text-foreground">
                  Inter-Facility Resource Transfers Tracking
                </h3>
              </div>
              <div className="overflow-x-auto">
                {activeTransfers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                    No active inter-facility stock transfers currently in progress.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-card/90 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-teal-500/15">
                      <tr>
                        <th className="p-3.5 sm:px-5">Resource</th>
                        <th className="p-3.5">Source (Donor)</th>
                        <th className="p-3.5">Target (Deficit)</th>
                        <th className="p-3.5">Quantity</th>
                        <th className="p-3.5">Distance</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 sm:px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-500/10">
                      {activeTransfers.map((tr) => (
                        <tr key={tr._id} className="hover:bg-teal-500/10 transition-colors">
                          <td className="p-3.5 sm:px-5 font-bold text-foreground">{tr.resourceName}</td>
                          <td className="p-3.5 text-foreground">{tr.sourcePHC?.name}</td>
                          <td className="p-3.5 text-teal-600 dark:text-teal-300 font-bold">{tr.targetPHC?.name}</td>
                          <td className="p-3.5 font-black text-foreground font-mono">{tr.quantity} {tr.unit}</td>
                          <td className="p-3.5 font-mono text-muted-foreground">{tr.distanceKm} km</td>
                          <td className="p-3.5">
                            <Badge
                              variant="outline"
                              className={
                                tr.status === "Completed"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/15 text-[10px] font-bold"
                                  : tr.status === "In Transit"
                                    ? "border-blue-500/40 text-blue-400 bg-blue-500/15 text-[10px] font-bold"
                                    : "border-amber-500/40 text-amber-400 bg-amber-500/15 text-[10px] font-bold"
                              }
                            >
                              {tr.status}
                            </Badge>
                          </td>
                          <td className="p-3.5 sm:px-5 text-right space-x-2">
                            {tr.status === "Pending Approval" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "APPROVE")}
                                className="mermaid-btn text-xs font-bold h-8 px-3 rounded-xl shadow-sm"
                              >
                                Approve
                              </Button>
                            )}
                            {tr.status === "Approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "DISPATCH")}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-sm"
                              >
                                Dispatch
                              </Button>
                            )}
                            {tr.status === "In Transit" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(tr._id, "RECEIVE")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-sm"
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── TRANSFER REVIEW & AUTHORIZATION MODAL (ANTIGRAVITY GLASS) ── */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="max-w-lg mermaid-glass border border-teal-500/30 text-foreground shadow-2xl rounded-3xl p-6">
          <DialogHeader className="border-b border-teal-500/15 pb-3">
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#05D3B3]" />
              {t("phc.authorizeInterFacilityTransfer", "Authorize Inter-Facility Transfer")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("phc.aiMatchScore", "AI Recommendation Match Score")}: {selectedRec?.aiScore}/100
            </DialogDescription>
          </DialogHeader>

          {selectedRec && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-2xl bg-card/60 border border-teal-500/15 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phc.resource", "Resource")}:</span>
                  <span className="font-bold text-foreground text-sm font-sans">{selectedRec.resourceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phc.authorizedQty", "Authorized Quantity")}:</span>
                  <span className="font-black text-[#05D3B3] text-sm">
                    {selectedRec.transferQuantity} {selectedRec.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phc.donorFacility", "Donor Facility")}:</span>
                  <span className="text-foreground">{selectedRec.sourcePHC?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phc.targetDeficitFacility", "Target Deficit Facility")}:</span>
                  <span className="text-rose-500 font-bold">{selectedRec.targetPHC?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phc.transitDistanceEta", "Transit Distance / ETA")}:</span>
                  <span className="text-foreground">
                    {selectedRec.distanceKm} km (~{selectedRec.transportTimeEst})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                ↳ {t("phc.reasoning", "Reasoning")}: {selectedRec.reasoning}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-teal-500/15">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransferModalOpen(false)}
                  className="rounded-xl border-teal-500/30 text-muted-foreground text-xs"
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  size="sm"
                  disabled={approving}
                  onClick={() => handleApproveRec(selectedRec)}
                  className="mermaid-btn rounded-xl font-bold uppercase tracking-wider text-xs px-4"
                >
                  {approving ? t("common.authorizing", "Authorizing...") : t("phc.authorizeDispatch", "Authorize & Dispatch")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
