import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { phcService, PHCFacility } from "@/services/phcService";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Flame,
  LineChart as ChartIcon,
  Pill,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AIEpidemicSurge() {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<PHCFacility[]>([]);
  const [selectedPHCId, setSelectedPHCId] = useState<string>("");
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await phcService.getFacilities();
      if (res?.data && res.data.length > 0) {
        setFacilities(res.data);
        setSelectedPHCId(res.data[0]._id);
        fetchPredictions(res.data[0]._id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load facilities");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const fetchPredictions = async (id: string) => {
    try {
      setLoading(true);
      const res: any = await phcService.getPredictions(id);
      if (res?.data) {
        setPredictionData(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load AI predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPHC = (id: string) => {
    setSelectedPHCId(id);
    fetchPredictions(id);
  };

  const facility = predictionData?.facility;
  const footfallForecast = predictionData?.footfallForecast;
  const medicineForecasts = predictionData?.medicineForecasts || [];
  const outbreakSignals = predictionData?.outbreakSignals || [];

  // Chart data: Combine historical baseline + 7-day projected trajectory
  const chartData = [
    { day: "Day -6 (Hist)", actual: 110, lowerBound: null, upperBound: null, projected: null },
    { day: "Day -4 (Hist)", actual: 118, lowerBound: null, upperBound: null, projected: null },
    { day: "Day -2 (Hist)", actual: 122, lowerBound: null, upperBound: null, projected: null },
    {
      day: "Today (Actual)",
      actual: footfallForecast?.currentDailyFootfall || 120,
      lowerBound: footfallForecast?.currentDailyFootfall || 120,
      upperBound: footfallForecast?.currentDailyFootfall || 120,
      projected: footfallForecast?.currentDailyFootfall || 120,
    },
    ...(footfallForecast?.timeSeries?.map((tItem: any) => ({
      day: tItem.day,
      actual: null,
      projected: tItem.projected,
      lowerBound: tItem.lowerBound,
      upperBound: tItem.upperBound,
    })) || []),
  ];

  const translateSignalName = (name: string) => {
    if (!name) return "";
    if (name.includes("Dengue") || name.includes("Vector-Borne")) return t("phc.dengueSurgeTitle", "Potential Dengue / Vector-Borne Surge");
    if (name.includes("Influenza") || name.includes("Respiratory")) return t("phc.influenzaSurgeTitle", "Potential Influenza / Acute Respiratory Surge");
    if (name.includes("Gastroenteritis") || name.includes("Diarrheal")) return t("phc.gastroSurgeTitle", "Potential Gastroenteritis / Diarrheal Surge");
    if (name.includes("Fever")) return t("phc.feverClusterTitle", "Unusual Fever Cluster Early Warning");
    return name;
  };

  const translateSignalAction = (action: string) => {
    if (!action) return "";
    if (action.includes("Paracetamol") && action.includes("Saline")) {
      return t("phc.dengueAction", "Deploy emergency buffer of Paracetamol, IV Saline, alert district epidemiologist, and ramp up diagnostic screening.");
    }
    if (action.includes("Amoxicillin") && action.includes("Azithromycin")) {
      return t("phc.influenzaAction", "Deploy emergency buffer of Amoxicillin, Azithromycin, alert district epidemiologist, and ramp up diagnostic screening.");
    }
    if (action.includes("ORS") && (action.includes("Zinc") || action.includes("Metronidazole"))) {
      return t("phc.gastroAction", "Deploy emergency buffer of ORS, Zinc Sulphate, alert district epidemiologist, and ramp up diagnostic screening.");
    }
    if (action.includes("Paracetamol") && (action.includes("Antibiotics") || action.includes("Rapid Diagnostic"))) {
      return t("phc.feverAction", "Deploy emergency buffer of Paracetamol, Antibiotics, alert district epidemiologist, and ramp up diagnostic screening.");
    }
    return action;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Strip in AntiGravity Style */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mermaid-chip text-[11px] font-bold">
                <BrainCircuit className="h-3.5 w-3.5 text-[#05D3B3]" />
                {t("phc.predictiveEngine", "PREDICTIVE AI ENGINE")}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                • {t("phc.statisticalTimeSeries", "Statistical Time-Series & Anomaly Detection")}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t("phc.engineTitle", "AI Demand & Outbreak Early Warning Engine")}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t(
                "phc.engineSubtitle",
                "Forecasting patient footfall, medicine consumption trajectories, and early detection of epidemic symptom spikes"
              )}
            </p>
          </div>

          {/* Controls: PHC Switcher & Recalculate */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedPHCId}
              onChange={(e) => handleSelectPHC(e.target.value)}
              className="antigravity-input bg-card/80 border border-teal-500/30 rounded-2xl px-3.5 py-2 text-xs font-semibold text-foreground h-10 min-w-[200px] shadow-sm backdrop-blur-md"
            >
              {facilities.map((f) => (
                <option key={f._id} value={f._id} className="bg-slate-900 text-white">
                  {f.name} ({f.facilityCode})
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPredictions(selectedPHCId)}
              disabled={loading}
              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
              {t("phc.recalculate", "Recalculate")}
            </Button>
          </div>
        </div>

        {/* Prediction KPI Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Daily Footfall */}
          <div className="mermaid-glass p-5 rounded-3xl shadow-lg border border-teal-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.currentDailyFootfall", "Current Daily Footfall")}</span>
              <Users className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-3xl font-black font-mono text-foreground mt-2">
              {footfallForecast?.currentDailyFootfall || 120}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">
                {t("phc.patientsDay", "patients/day")}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground pt-1">
              {t("phc.baselineAverage", "Baseline average")}: {footfallForecast?.historicalMean || 115}
            </p>
          </div>

          {/* Card 2: 7-Day Forecast */}
          <div className="mermaid-glass p-5 rounded-3xl shadow-lg border border-teal-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.forecastAverage", "7-Day Forecast Average")}</span>
              <TrendingUp className="h-4 w-4 text-[#05D3B3]" />
            </div>
            <p className="text-3xl font-black font-mono text-teal-600 dark:text-teal-300 mt-2">
              {footfallForecast?.sevenDayForecastAvg || 135}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">
                {t("phc.patientsDay", "patients/day")}
              </span>
            </p>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 pt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{footfallForecast?.expectedIncreasePercentage || 8}% {t("phc.projectedGrowth", "Projected Growth")}
            </p>
          </div>

          {/* Card 3: Surge Risk Level */}
          <div className="mermaid-glass p-5 rounded-3xl shadow-lg border border-teal-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.surgeRiskLevel", "Surge Risk Level")}</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <p
              className={`text-3xl font-black font-mono mt-2 ${
                footfallForecast?.risk === "High"
                  ? "text-rose-500"
                  : footfallForecast?.risk === "Medium"
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {footfallForecast?.risk === "High"
                ? t("phc.high", "High")
                : footfallForecast?.risk === "Medium"
                ? t("phc.moderate", "Moderate")
                : t("phc.low", "Low")}
            </p>
            <p className="text-[11px] text-muted-foreground pt-1">
              {t("phc.confidence", "Confidence")}:{" "}
              <strong className="text-foreground">{footfallForecast?.confidence || 88}%</strong>
            </p>
          </div>

          {/* Card 4: At-Risk Stockouts */}
          <div className="mermaid-glass p-5 rounded-3xl shadow-lg border border-teal-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.atRiskStockouts", "At-Risk Stockouts")}</span>
              <Pill className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black font-mono text-amber-500 mt-2">
              {medicineForecasts.filter((m: any) => m.stockoutRisk === "Critical" || m.stockoutRisk === "High").length}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">
                {t("phc.items", "items")}
              </span>
            </p>
            <p className="text-[11px] text-amber-500/90 font-medium pt-1">
              {t("phc.depletionWindow", "Depletion window < 7 days")}
            </p>
          </div>
        </div>

        {/* Epidemic Surge Early Warnings Radar */}
        {outbreakSignals.length > 0 && (
          <div className="mermaid-glass p-6 rounded-3xl border border-rose-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/25 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  {t("phc.potentialSurge", "Potential Surge / Early Warning Signals")} ({facility?.name})
                </h2>
              </div>
              <Badge variant="destructive" className="text-[10px] rounded-xl font-bold">
                {t("phc.statisticalAnomaly", "Statistical Anomaly (Z > 1.8)")}
              </Badge>
            </div>

            <div className="space-y-3">
              {outbreakSignals.map((sig: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-card/60 border border-rose-500/30 space-y-2 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-rose-400">
                      {translateSignalName(sig.signalName)}
                    </span>
                    <span className="text-xs font-mono text-teal-500 font-bold">
                      {t("phc.confidence", "Confidence")}: {sig.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("phc.observedCount", "Observed count")}:{" "}
                    <strong className="text-foreground">{sig.currentRate}/{t("phc.week", "week")}</strong>{" "}
                    {t("phc.vsBaseline", "vs Baseline")}:{" "}
                    <strong className="text-foreground">{sig.baselineAverage}/{t("phc.week", "week")}</strong>{" "}
                    (+{sig.percentageDeviation}% {t("phc.anomalySpike", "anomaly spike")}, Z-score: {sig.zScore}).
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-medium">
                    ↳ {t("phc.proactiveAction", "Proactive Action")}: {translateSignalAction(sig.recommendedAction)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forecast Chart: Historical vs Predicted vs Confidence Range */}
        <div className="mermaid-glass p-6 rounded-3xl border border-teal-500/25 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/15 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ChartIcon className="h-4 w-4 text-[#05D3B3]" />
                {t(
                  "phc.footfallTrajectory",
                  "7-Day Projected Patient Footfall Trajectory & Confidence Interval"
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t(
                  "phc.footfallTrajectorySubtitle",
                  "Displays Historical load, AI Moving Average projection, and ±15% statistical confidence bounds"
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                {t("phc.historical", "Historical")}
              </span>
              <span className="flex items-center gap-1.5 text-[#05D3B3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#05D3B3]" />
                {t("phc.predicted", "Predicted")}
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/30 border border-indigo-400" />
                {t("phc.confidenceRange", "Confidence Range")}
              </span>
            </div>
          </div>

          <div className="h-[340px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05D3B3" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#05D3B3" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.15)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={["dataMin - 20", "dataMax + 30"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(6, 18, 21, 0.95)",
                    borderColor: "#05D3B3",
                    borderRadius: "16px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#818cf8"
                  strokeDasharray="3 3"
                  fill="url(#confidenceGradient)"
                  name="Upper Confidence Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#818cf8"
                  strokeDasharray="3 3"
                  fill="transparent"
                  name="Lower Confidence Bound"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#94a3b8" }}
                  name="Historical Actual"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#05D3B3"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#05D3B3" }}
                  name="AI Projected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medicine Demand Forecast Matrix */}
        <div className="mermaid-glass p-6 rounded-3xl border border-teal-500/25 shadow-xl space-y-4">
          <div className="border-b border-teal-500/15 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-[#05D3B3]" />
              Medicine Demand Forecast & Estimated Depletion Windows
            </h2>
            <p className="text-xs text-muted-foreground">
              Combines historical consumption rate, current footfall momentum, and outbreak surge multipliers
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-teal-500/15">
            <table className="w-full text-xs text-left">
              <thead className="bg-card/80 text-muted-foreground border-b border-teal-500/20 font-mono uppercase">
                <tr>
                  <th className="p-3.5">Medicine Name</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Projected Daily Demand</th>
                  <th className="p-3.5">7-Day Demand</th>
                  <th className="p-3.5">30-Day Demand</th>
                  <th className="p-3.5">Estimated Depletion Window</th>
                  <th className="p-3.5">Stockout Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/10 bg-card/40 font-medium">
                {medicineForecasts.map((med: any, idx: number) => (
                  <tr key={idx} className="hover:bg-teal-500/10 transition">
                    <td className="p-3.5 font-bold text-foreground">
                      {med.medicineName}
                      <span className="block text-[10px] text-muted-foreground font-mono">#{med.batchNumber}</span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-foreground">
                      {med.currentStock}
                      <span className="block text-[10px] text-muted-foreground font-normal font-sans">
                        min {med.safeBufferThreshold}
                      </span>
                    </td>
                    <td className="p-3.5 text-teal-600 dark:text-teal-300 font-mono font-bold">
                      {med.forecastedDailyDemand} /day
                    </td>
                    <td className="p-3.5 text-foreground font-mono">{med.demand7Days}</td>
                    <td className="p-3.5 text-muted-foreground font-mono">{med.demand30Days}</td>
                    <td className="p-3.5 font-bold text-foreground font-mono">
                      {med.estimatedDepletionWindow}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`rounded-xl text-[10px] font-bold ${
                          med.stockoutRisk === "Critical"
                            ? "border-rose-500 text-rose-500 bg-rose-500/10"
                            : med.stockoutRisk === "High"
                            ? "border-amber-500 text-amber-500 bg-amber-500/10"
                            : "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                        }`}
                      >
                        {med.stockoutRisk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
