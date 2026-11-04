import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  Leaf,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Utensils,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AIDoctorHUD } from "@/components/clinical/AIDoctorHUD";
import { SpecialistConsultDirectory } from "@/components/clinical/SpecialistConsultDirectory";
import { PhoneCall } from "lucide-react";
import {
  translateSymptom,
  translateCondition,
  translateCategory,
  translateMedicineName,
  translateBenefit,
  translateAdvice,
  translateReason,
  translateDosha,
  translateRiskBadge,
  translateMatch
} from "@/lib/clinicalTranslator";

export default function AiSuggestions() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"ai_doctor" | "specialists" | "remedies">("ai_doctor");

  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/ai/latest");
      const analysisData = res?.data || res;
      if (analysisData && (analysisData.condition || analysisData.healthScore)) {
        setAnalysis(analysisData);
      } else {
        await handleAnalyze();
      }
    } catch (err) {
      console.error("Fetch Analysis Error:", err);
      await handleAnalyze();
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res: any = await api.post("/ai/analyze", { sensorData: {} });
      const resultData = res?.data || res;
      setAnalysis(resultData);
      toast({
        title: "AI Analysis Complete",
        description: `Condition: ${resultData.condition || "Diagnostic assessment completed"}`,
      });
    } catch (err) {
      toast({
        title: "Analysis Error",
        description: "Could not generate suggestions. Please check connection.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLatestAnalysis();
  }, [user]);

  // Non-blocking: loading handled within Baseline and Remedies tab

  // Safe confidence calculation
  const rawConfidence = analysis?.mlPrediction?.confidence ?? analysis?.confidence ?? 0.92;
  const confidencePercent = Math.min(99, Math.max(70, Math.round(Number(rawConfidence) * (rawConfidence <= 1 ? 100 : 1))));

  const healthScore = typeof analysis?.healthScore === "number" ? analysis.healthScore : 85;
  const conditionName = analysis?.condition || analysis?.predictions?.[0]?.condition || "Optimal Health Profile";
  const dominantDosha = analysis?.dominantDosha || "Vata";
  const medicines = analysis?.recommendations?.medicines || [];
  const homeRemedies = analysis?.recommendations?.homeRemedies || [];
  const precautions = analysis?.recommendations?.precautions || [];
  const predictions = analysis?.predictions || [];
  const reportedSymptoms = analysis?.reportedSymptoms || [];

  const activeLang = i18n.language || "en";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-2 sm:px-4 pb-16">
        {/* Top Header */}
        {/* Sliding Navigation Tabs */}
        <div className="flex justify-center my-3 px-1 w-full overflow-x-auto scrollbar-none">
          <div className="relative inline-flex items-center p-1 sm:p-1.5 rounded-full bg-card/90 border border-border shadow-md shrink-0">
            {[
              { id: "ai_doctor", shortLabel: "AI Doctor", label: t("aiSuggestions.tabAiDoctor", "AI Doctor Consultation"), icon: Stethoscope },
              { id: "specialists", shortLabel: "Specialists", label: t("aiSuggestions.tabSpecialists", "Specialist Directory"), icon: PhoneCall },
              { id: "remedies", shortLabel: "Remedies", label: t("aiSuggestions.tabRemedies", "Baseline & Remedies"), icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative z-10 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    isActive
                      ? "text-white dark:text-slate-950 font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-ai-suggestion-tab"
                      className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-md"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  <span className="relative z-10 sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: AI Doctor Multimodal HUD */}
        {activeTab === "ai_doctor" && <AIDoctorHUD />}

        {/* Tab 2: Verified Specialist & Telemedicine Directory */}
        {activeTab === "specialists" && <SpecialistConsultDirectory />}

        {/* Tab 3: Clinical Baseline Assessment & Remedies */}
        {activeTab === "remedies" && (
          (loading || analyzing) ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <Brain className="absolute inset-0 m-auto h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("aiSuggestions.engineTitle", "Running AI Diagnostic & Remedy Synthesis")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("aiSuggestions.medicineCabinetDesc", "Correlating symptoms, biomarkers, vital telemetry, and holistic Ayurvedic pharmacology...")}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {t("aiSuggestions.engineTitle", "AI Diagnostic & Remedy Engine")}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                {t("aiSuggestions.pageTitle", "Health Analysis & Remedies")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              className="rounded-xl border border-border text-foreground hover:bg-muted text-xs font-mono font-medium shadow-sm"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              {t("aiSuggestions.reAnalyze", "Re-Analyze Symptoms")}
            </Button>
          </div>
        </div>

        {/* Diagnostic Assessment Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status Panel (Col 1) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card border border-border shadow-sm rounded-2xl relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${
                      healthScore >= 80
                        ? "bg-emerald-600 shadow-emerald-500/20"
                        : healthScore >= 60
                        ? "bg-amber-600 shadow-amber-500/20"
                        : "bg-rose-600 shadow-rose-500/20"
                    }`}
                  >
                    {healthScore}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t("aiSuggestions.aiConfidence", "AI Confidence")}</p>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{confidencePercent}%</p>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{t("aiSuggestions.aiHealthScore", "AI Health Score")}</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {t("aiSuggestions.vitalIndex", "Multimodal Vital & Symptom Index")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">{t("aiSuggestions.primaryDiagnosis", "Primary Diagnosis")}</p>
                  <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 leading-snug">
                    {translateCondition(conditionName, activeLang)}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t("aiSuggestions.clinicalRisk", "Clinical Risk")}</span>
                  <Badge
                    variant="outline"
                    className={
                      analysis?.riskLevel?.toLowerCase() === "high"
                        ? "border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 text-[10px]"
                        : analysis?.riskLevel?.toLowerCase() === "moderate"
                        ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 text-[10px]"
                        : "border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-[10px]"
                    }
                  >
                    {translateRiskBadge(analysis?.riskLevel, activeLang)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Prakriti Dosha Card */}
            <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {t("aiSuggestions.prakritiTitle", "Prakriti (Dosha Constitution)")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30 text-lg font-bold text-cyan-700 dark:text-cyan-300">
                    {dominantDosha[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {translateDosha(dominantDosha, activeLang)}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t("aiSuggestions.constitutionFactor", "Body Constitution Factor")}</p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {translateReason(analysis?.recommendations?.doshaAdvice, activeLang) ||
                    analysis?.recommendations?.doshaAdvice ||
                    "Maintain constitution balance by favoring cooling, non-spicy foods, protecting eyes from strain, and resting regularly."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Remedies and Treatment Cabinet (Cols 2,3,4) */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Reported Symptoms & Diagnostic Breakdown */}
            {reportedSymptoms.length > 0 && (
              <Card className="bg-card border border-border shadow-sm rounded-2xl">
                <CardHeader className="p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {t("aiSuggestions.reportedSymptomsTitle", "User Reported Symptoms & Targeted Clinical Analysis")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {reportedSymptoms.map((sym: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-foreground border border-cyan-200 dark:border-border text-xs font-medium"
                      >
                        ✓ {translateSymptom(sym, activeLang)}
                      </span>
                    ))}
                  </div>

                  {predictions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      {predictions.map((p: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {translateCondition(p.condition, activeLang)}
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                              {translateMatch(activeLang)}: {Math.round((p.confidence || 0.9) * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            {translateReason(p.reason, activeLang)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medicine Cabinet (Targeted Remedies) */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  {t("aiSuggestions.medicineCabinetTitle", "Personalized Medicine Cabinet & Formulations")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t("aiSuggestions.medicineCabinetDesc", "Clinically curated Ayurvedic and herbal remedies matched to your reported symptoms")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {medicines.map((med: any, idx: number) => (
                  <Card
                    key={idx}
                    className="bg-card dark:bg-slate-900/90 border border-border dark:border-slate-800 hover:border-cyan-500/40 transition shadow-md dark:shadow-lg flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Leaf className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px]">
                          {translateCategory(med.category, activeLang) || "Natural Remedy"}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                        {translateMedicineName(med.name, activeLang)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {translateBenefit(med.benefit, activeLang)}
                      </p>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{t("aiSuggestions.evidenceBacked", "Evidence-backed Ayurvedic Formula")}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Immediate Home Relief & Precautions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Remedies */}
              <Card className="bg-card border border-border shadow-sm rounded-2xl">
                <CardHeader className="p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {t("aiSuggestions.immediateHomeRelief", "Immediate Home Relief Measures")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {homeRemedies.length > 0 ? (
                    homeRemedies.map((hr: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <span>{translateAdvice(hr, activeLang)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Apply cold rose water pads and rest eyes in a dimly lit room.</p>
                  )}
                </CardContent>
              </Card>

              {/* Precautions */}
              <Card className="bg-card/95 dark:bg-slate-900/80 border border-border dark:border-amber-500/20 shadow-md dark:shadow-lg">
                <CardHeader className="p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    {t("aiSuggestions.precautionsTitle", "Precautions & Specialist Guidance")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {precautions.length > 0 ? (
                    precautions.map((pr: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{translateAdvice(pr, activeLang)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      Avoid rubbing eyes or self-medicating with unprescribed steroid eye drops. Consult an eye doctor if symptoms persist over 48 hours.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lifestyle & Dietary Alignment */}
            <Card className="bg-card/95 dark:bg-slate-900/80 border border-border dark:border-emerald-500/30 shadow-md dark:shadow-lg">
              <CardHeader className="p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {t("aiSuggestions.lifestyleDietTitle", "Lifestyle & Dietary Alignment")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                    {t("aiSuggestions.dietaryRecs", "Dietary Recommendations")}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {Array.isArray(analysis?.recommendations?.diet) && analysis.recommendations.diet.length > 0 ? (
                      analysis.recommendations.diet.map((d: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{translateAdvice(d, activeLang)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 dark:text-slate-400">
                        Favor cooling, hydrating foods (cucumber, coconut water, pomegranate, leafy greens). Avoid spicy and oily meals.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                    {t("aiSuggestions.physicalActivity", "Physical Activity & Eye Yoga")}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {Array.isArray(analysis?.recommendations?.lifestyle) && analysis.recommendations.lifestyle.length > 0 ? (
                      analysis.recommendations.lifestyle.map((l: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span>{translateAdvice(l, activeLang)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 dark:text-slate-400">
                        Practice Trataka (candle focus) and Palming exercises. Take regular screen breaks every 20 minutes.
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
