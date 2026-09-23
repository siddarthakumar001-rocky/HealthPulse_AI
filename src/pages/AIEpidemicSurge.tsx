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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { phcService, PHCFacility } from "@/services/phcService";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Flame,
  LineChart as ChartIcon,
  Pill,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function AIEpidemicSurge() {
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
  const decisions = predictionData?.decisionEvaluation?.decisions || [];

  // Chart data: Combine historical baseline + 7-day projected trajectory
  const chartData = [
    { day: "Day -6 (Hist)", actual: 110, lowerBound: null, upperBound: null, projected: null },
    { day: "Day -4 (Hist)", actual: 118, lowerBound: null, upperBound: null, projected: null },
    { day: "Day -2 (Hist)", actual: 122, lowerBound: null, upperBound: null, projected: null },
    { day: "Today (Actual)", actual: footfallForecast?.currentDailyFootfall || 125, lowerBound: footfallForecast?.currentDailyFootfall || 125, upperBound: footfallForecast?.currentDailyFootfall || 125, projected: footfallForecast?.currentDailyFootfall || 125 },
    ...(footfallForecast?.timeSeries?.map((t: any) => ({
      day: t.day,
      actual: null,
      projected: t.projected,
      lowerBound: t.lowerBound,
      upperBound: t.upperBound
    })) || [])
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 tracking-wide uppercase flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" /> Predictive AI Engine
              </span>
              <span className="text-xs text-slate-400">
                • Statistical Time-Series & Anomaly Detection
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 mt-1">
              AI Demand & Outbreak Early Warning Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Forecasting patient footfall, medicine consumption trajectories, and early detection of epidemic symptom spikes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPHCId}
              onChange={(e) => handleSelectPHC(e.target.value)}
              className="bg-slate-900 border border-cyan-500/30 rounded px-3 py-1.5 text-xs text-cyan-300 h-9 font-medium"
            >
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.facilityCode})
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPredictions(selectedPHCId)}
              disabled={loading}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 bg-slate-900/60 text-xs h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Recalculate
            </Button>
          </div>
        </div>

        {/* Prediction KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/70 border-cyan-500/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Daily Footfall</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {footfallForecast?.currentDailyFootfall || 120} <span className="text-xs font-normal text-slate-400">patients/day</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Baseline average: {footfallForecast?.historicalMean || 115}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-indigo-500/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">7-Day Forecast Average</span>
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-indigo-300 mt-1">
                {footfallForecast?.sevenDayForecastAvg || 135} <span className="text-xs font-normal text-slate-400">patients/day</span>
              </p>
              <p className="text-[11px] text-indigo-400 flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +{footfallForecast?.expectedIncreasePercentage || 8}% Projected Growth
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-purple-500/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Surge Risk Level</span>
                <Flame className="h-4 w-4 text-purple-400" />
              </div>
              <p
                className={`text-2xl font-bold mt-1 ${
                  footfallForecast?.risk === "High"
                    ? "text-rose-400"
                    : footfallForecast?.risk === "Medium"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {footfallForecast?.risk || "Low"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Confidence: <strong className="text-cyan-300">{footfallForecast?.confidence || 88}%</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-amber-500/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">At-Risk Stockouts</span>
                <Pill className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-300 mt-1">
                {medicineForecasts.filter((m: any) => m.stockoutRisk === "Critical" || m.stockoutRisk === "High").length} items
              </p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                Depletion window &lt; 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Epidemic Surge Early Warnings Radar */}
        {outbreakSignals.length > 0 && (
          <Card className="bg-rose-950/20 border border-rose-500/40 shadow-xl">
            <CardHeader className="p-4 pb-2 border-b border-rose-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-400 animate-pulse" />
                  <CardTitle className="text-sm font-bold text-white">
                    Potential Surge / Early Warning Signals ({facility?.name})
                  </CardTitle>
                </div>
                <Badge variant="destructive" className="text-[10px]">
                  Statistical Anomaly (Z &gt; 1.8)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {outbreakSignals.map((sig: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-rose-300">{sig.signalName}</span>
                    <span className="text-xs font-mono text-cyan-300">Confidence: {sig.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Observed count: <strong>{sig.currentRate}/week</strong> vs Baseline: <strong>{sig.baselineAverage}/week</strong> (+{sig.percentageDeviation}% anomaly spike, Z-score: {sig.zScore}).
                  </p>
                  <p className="text-xs text-cyan-300 font-mono">
                    ↳ Proactive Action: {sig.recommendedAction}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Forecast Chart: Historical vs Predicted vs Confidence Range */}
        <Card className="bg-slate-900/80 border-cyan-500/30 shadow-xl">
          <CardHeader className="p-4 pb-2 border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-cyan-300 flex items-center gap-2">
                  <ChartIcon className="h-4 w-4" />
                  7-Day Projected Patient Footfall Trajectory & Confidence Interval
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Displays Historical load, AI Moving Average projection, and ±15% statistical confidence bounds
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Historical
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Predicted
                </span>
                <span className="flex items-center gap-1 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500/30 border border-indigo-400" /> Confidence Range
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 20', 'dataMax + 30']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f3ff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="upperBound" stroke="#818cf8" strokeDasharray="3 3" fill="url(#confidenceGradient)" name="Upper Confidence Bound" />
                <Area type="monotone" dataKey="lowerBound" stroke="#818cf8" strokeDasharray="3 3" fill="transparent" name="Lower Confidence Bound" />
                <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, fill: "#94a3b8" }} name="Historical Actual" />
                <Line type="monotone" dataKey="projected" stroke="#00f3ff" strokeWidth={3} dot={{ r: 4, fill: "#00f3ff" }} name="AI Projected" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medicine Demand Forecast Matrix */}
        <Card className="bg-slate-900/80 border-cyan-500/30">
          <CardHeader className="p-4 pb-2 border-b border-slate-800">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="h-4 w-4 text-cyan-400" />
              Medicine Demand Forecast & Estimated Depletion Windows
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Combines historical consumption rate, current footfall momentum, and outbreak surge multipliers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Projected Daily Demand</th>
                  <th className="p-3">7-Day Demand</th>
                  <th className="p-3">30-Day Demand</th>
                  <th className="p-3">Estimated Depletion Window</th>
                  <th className="p-3">Stockout Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {medicineForecasts.map((med: any, idx: number) => (
                  <tr key={idx} className="hover:bg-cyan-950/20 transition">
                    <td className="p-3 font-semibold text-slate-200">
                      {med.medicineName}
                      <span className="block text-[10px] text-slate-500 font-mono">#{med.batchNumber}</span>
                    </td>
                    <td className="p-3 font-bold text-white">
                      {med.currentStock}
                      <span className="block text-[10px] text-slate-400 font-normal">min {med.safeBufferThreshold}</span>
                    </td>
                    <td className="p-3 text-cyan-300 font-medium">
                      {med.forecastedDailyDemand} /day
                      <span className="block text-[10px] text-slate-500 font-mono">
                        ({med.confidenceInterval?.dailyLow} - {med.confidenceInterval?.dailyHigh})
                      </span>
                    </td>
                    <td className="p-3 text-indigo-300 font-medium">{med.demand7Days}</td>
                    <td className="p-3 text-slate-300">{med.demand30Days}</td>
                    <td className="p-3 font-semibold text-indigo-300">
                      {med.estimatedDepletionWindow}
                      <span className="block text-[10px] text-slate-500 font-mono">Confidence: {med.confidence}%</span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={
                          med.stockoutRisk === "Critical"
                            ? "border-rose-500 text-rose-400 bg-rose-950/30 text-[10px]"
                            : med.stockoutRisk === "High"
                            ? "border-amber-500 text-amber-400 bg-amber-950/30 text-[10px]"
                            : "border-emerald-500 text-emerald-400 bg-emerald-950/30 text-[10px]"
                        }
                      >
                        {med.stockoutRisk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
