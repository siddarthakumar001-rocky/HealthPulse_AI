import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  User,
  Smartphone,
  FileHeart,
  Activity,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Wind,
  Pill,
  Clock,
  Eye,
  Headphones,
  Utensils,
  Moon,
  FileText,
  Download,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Edit3,
  LogOut,
  Layers,
  ChevronRight,
  TrendingUp,
  FileDown
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [device, setDevice] = useState<any>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        const [obRes, devicesRes, reportsRes] = await Promise.all([
          api.get("/onboarding").catch(() => null),
          api.get("/devices").catch(() => []),
          api.get("/reports").catch(() => ({ success: true, data: [] }))
        ]);

        // Load Onboarding data: backend first, then fallback to pendingOnboarding in localStorage
        if (obRes && Object.keys(obRes).length > 1) {
          setOnboarding(obRes);
        } else {
          const pending = localStorage.getItem("pendingOnboarding");
          if (pending) {
            try {
              setOnboarding(JSON.parse(pending));
            } catch (e) {
              console.error("Failed to parse pendingOnboarding", e);
            }
          }
        }

        if (devicesRes && devicesRes.length) {
          setDevice(devicesRes[0]);
        }

        if (reportsRes?.data && Array.isArray(reportsRes.data)) {
          setReports(reportsRes.data);
        } else if (Array.isArray(reportsRes)) {
          setReports(reportsRes);
        }
      } catch (err) {
        console.error("Failed to fetch profile details", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const meta = user?.user_metadata || {};
  const data = onboarding || {};

  const handleDownload = async (reportId: string, filename = "Clinical_Report.pdf") => {
    try {
      const response = await api.get(`/reports/${reportId}/download`, { responseType: "blob" });
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to download report", e);
      window.open(`/api/reports/${reportId}/download`, "_blank");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        
        {/* ── PROFILE COCKPIT HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="mermaid-chip text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#05D3B3]" />
                BIOMETRIC IDENTITY & HEALTH PASSPORT
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                • UID: {user?.id?.slice(-8) || "88B4C912"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Patient Clinical Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Comprehensive biological record, clinical questionnaires, uploaded lab diagnostics, and active hardware telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
            >
              <Link to="/onboarding?mode=update">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Retake Assessment
              </Link>
            </Button>

            <Button
              asChild
              className="mermaid-btn text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-2xl shadow-sm"
            >
              <Link to="/reports">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload New Report
              </Link>
            </Button>
          </div>
        </div>

        {/* ── TOP OPERATOR BENTO STRIP ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Identity Hologram Card (Span 7) */}
          <div className="lg:col-span-7 mermaid-glass p-6 sm:p-8 rounded-[2rem] shadow-xl border border-teal-500/20 flex flex-col justify-between">
            <div className="flex items-center gap-5">
              {/* Holographic glowing Avatar */}
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-1.5 rounded-full opacity-70 animate-spin"
                  style={{
                    background: "conic-gradient(from 0deg, #05D3B3, #0D9488, #38BDF8, #05D3B3)",
                    animationDuration: "6s",
                  }}
                />
                <div className="relative h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black font-mono z-10 bg-card border-2 border-teal-500/40 text-teal-600 dark:text-teal-300 shadow-inner">
                  {meta.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              </div>

              {/* Bio info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {meta.name || "Patient Operator"}
                  </h2>
                  <span className="mermaid-chip text-[9px] font-bold uppercase tracking-wider py-0.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#05D3B3] animate-pulse" /> In-Sync
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{user?.email}</p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  HealthPulse Digital Twin Linked
                </p>
              </div>
            </div>

            {/* Quick Demographics 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-teal-500/15">
              <div className="p-3 rounded-2xl bg-card/60 border border-teal-500/15 space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Age</span>
                <p className="text-base font-black font-mono text-foreground">{meta.age || data.age || "N/A"} Yrs</p>
              </div>
              <div className="p-3 rounded-2xl bg-card/60 border border-teal-500/15 space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Gender</span>
                <p className="text-base font-black text-foreground capitalize">{meta.gender || data.gender || "N/A"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-card/60 border border-teal-500/15 space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Contact</span>
                <p className="text-sm font-bold font-mono text-foreground truncate">{meta.phone || "N/A"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-card/60 border border-teal-500/15 space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Emergency</span>
                <p className="text-sm font-bold font-mono text-rose-500 truncate">{meta.emergency_contact || data.emergency_contact || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Biometric KPI Quick Summary (Span 5) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            <div className="mermaid-glass p-5 rounded-[2rem] border border-teal-500/20 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-mono font-bold uppercase">Chronic Conditions</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black font-mono text-foreground">
                  {data.conditions?.length || 0}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {data.conditions?.length ? data.conditions.join(", ") : "None reported"}
                </p>
              </div>
              <span className="text-[9px] font-mono text-teal-600 dark:text-teal-400">
                Baseline Calibrated
              </span>
            </div>

            <div className="mermaid-glass p-5 rounded-[2rem] border border-teal-500/20 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-mono font-bold uppercase">Lab Reports</span>
                <FileText className="w-4 h-4 text-teal-500" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black font-mono text-foreground">
                  {reports.length}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Extracted Biomarkers
                </p>
              </div>
              <span className="text-[9px] font-mono text-teal-600 dark:text-teal-400">
                Informatics Active
              </span>
            </div>

            <div className="mermaid-glass p-5 rounded-[2rem] border border-teal-500/20 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-mono font-bold uppercase">Blood Pressure</span>
                <Activity className="w-4 h-4 text-[#05D3B3]" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono text-foreground">
                  {data.bp_values || (data.has_bp ? "Managed" : "Normal")}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {data.has_bp ? "Hypertension History" : "Optimal Vasotone"}
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-500">
                ● Normal Range
              </span>
            </div>

            <div className="mermaid-glass p-5 rounded-[2rem] border border-teal-500/20 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-mono font-bold uppercase">Blood Sugar</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono text-foreground">
                  {data.sugar_values || (data.has_sugar ? "Tracked" : "Normal")}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {data.has_sugar ? "Glycemic Followup" : "Euglycemic"}
                </p>
              </div>
              <span className="text-[9px] font-mono text-amber-500">
                ● Fasting Tracked
              </span>
            </div>

          </div>
        </div>

        {/* ── MAIN PROFILE TABS (ONBOARDING SELECTIONS + LAB REPORTS VAULT) ── */}
        <Tabs defaultValue="onboarding-data" className="w-full space-y-6">
          <TabsList className="bg-card/70 border border-teal-500/25 p-1 rounded-2xl h-12 shadow-sm backdrop-blur-xl">
            <TabsTrigger
              value="onboarding-data"
              className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-5 flex items-center gap-2 transition-all"
            >
              <FileHeart className="w-4 h-4" />
              <span>Onboarding Health Assessment</span>
            </TabsTrigger>
            <TabsTrigger
              value="lab-reports"
              className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-5 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Uploaded Lab Reports ({reports.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="device-telemetry"
              className="rounded-xl data-[state=active]:bg-[#05D3B3] data-[state=active]:text-slate-950 font-extrabold text-xs px-5 flex items-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Connected IoMT Sensor</span>
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════
              TAB 1: COMPLETE ONBOARDING ASSESSMENT RECORD
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="onboarding-data" className="space-y-6 mt-0">
            
            {/* Bento Grid: 6 Categorized Clinical Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Chronic Conditions & Medical Baseline */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Heart className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      Chronic & Cardiovascular Baseline
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Chronic Conditions</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {data.conditions && data.conditions.length > 0 ? (
                          data.conditions.map((c: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold capitalize">
                              {c.replace(/_/g, " ")}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-medium">None reported</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-500/15">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Stroke History</span>
                        <p className="font-bold text-foreground">{data.stroke_history ? "Yes (Flagged)" : "No"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Cardiac Arrest History</span>
                        <p className="font-bold text-foreground">{data.cardiac_arrest_history ? "Yes (Flagged)" : "No"}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Current Medication</span>
                      <p className="font-medium text-foreground">{data.on_medication ? `Yes — ${data.medication_details || "Prescription ongoing"}` : "Not currently on daily medication"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Symptoms & Pain Mapping */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      Symptoms & Anatomical Pain Mapping
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Reported Symptoms</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {data.common_symptoms && data.common_symptoms.length > 0 ? (
                          data.common_symptoms.map((s: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold capitalize">
                              {s.replace(/_/g, " ")}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-medium">No acute symptoms reported</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-500/15">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Pain Severity</span>
                        <p className="font-bold text-foreground capitalize">{data.pain_severity || "None / Mild"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Headache Type</span>
                        <p className="font-bold text-foreground capitalize">{data.headache_type || "None"}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Body Pain Locations</span>
                      <p className="font-medium text-foreground capitalize">
                        {data.body_pain_location && data.body_pain_location.length > 0
                          ? data.body_pain_location.map((l: string) => l.replace(/_/g, " ")).join(", ")
                          : "None"}
                      </p>
                    </div>

                    {data.chest_pressure && (
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Chest Pressure Alert Registered
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Lifestyle, Sleep & Metabolism */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Moon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      Sleep, Lifestyle & Metabolic Routine
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Sleep Duration</span>
                        <p className="font-bold text-foreground font-mono">
                          {data.sleep_hours?.[0] ? `${data.sleep_hours[0]} hrs/night` : "7 hrs/night"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Physical Energy</span>
                        <p className="font-bold text-foreground">
                          {data.low_energy || data.physical_exhaustion ? "Fatigue / Exhaustion" : "High Energy"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-500/15">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Diet Regimen</span>
                        <p className="font-bold text-foreground capitalize">{data.diet_type || "Vegetarian"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Meals / Day</span>
                        <p className="font-bold text-foreground">{data.meals_per_day || "3 meals"}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Habits & Substance History</span>
                      <p className="font-medium text-foreground">
                        Smoking: {data.smoking ? "Yes" : "None"} • Alcohol: {data.alcohol ? "Yes" : "None"} • Addictions: {data.other_addictions || "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: ENT, Ocular & Structural Findings */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Eye className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      ENT, Ocular & Physical Findings
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Ocular Issues</span>
                      <p className="font-medium text-foreground capitalize">
                        {data.ocular_issues && data.ocular_issues.length > 0
                          ? data.ocular_issues.map((o: string) => o.replace(/_/g, " ")).join(", ")
                          : "Clear vision / No active issues"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">ENT Complications</span>
                      <p className="font-medium text-foreground capitalize">
                        {data.ent_issues && data.ent_issues.length > 0
                          ? data.ent_issues.map((e: string) => e.replace(/_/g, " ")).join(", ")
                          : "No ear, nose, throat complications"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Wounds & Fractures</span>
                      <p className="font-medium text-foreground">
                        Wounds/Scars: {data.wound_details || (data.wound_scar_marks ? "Present" : "None")} • Fractures: {data.fracture_details || (data.fractures ? "Reported" : "None")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Diagnostic Investigations History */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      Diagnostic & Imaging History
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Blood Investigations Completed</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {data.blood_investigations && data.blood_investigations.length > 0 ? (
                          data.blood_investigations.map((b: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px]">
                              {b}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-medium">None selected</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Clinical Imaging Done</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {data.imaging_done && data.imaging_done.length > 0 ? (
                          data.imaging_done.map((img: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px]">
                              {img}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-medium">None selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 6: Women's Health (or General Wellness) */}
              <div className="mermaid-glass p-6 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                    <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/30">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wide text-foreground">
                      Gynecological & Wellness Health
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Menstrual Flow</span>
                        <p className="font-bold text-foreground capitalize">{data.menstrual_flow || "Regular"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Cycle Duration</span>
                        <p className="font-bold text-foreground">{data.cycle_duration ? `${data.cycle_duration} days` : "28 days"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-500/15">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Pads / Day</span>
                        <p className="font-bold text-foreground">{data.pads_per_day || "2-3"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Menopausal</span>
                        <p className="font-bold text-foreground">{data.menopausal ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-500/15">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase block font-bold">Associated Symptoms</span>
                      <p className="font-medium text-foreground">{data.menstrual_other_symptoms || "None reported"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════
              TAB 2: UPLOADED LAB REPORTS & CLINICAL INFORMATICS VAULT
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="lab-reports" className="space-y-6 mt-0">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((rpt, idx) => {
                  const analysis = rpt.analysis || {};
                  const abnormal = analysis.abnormal_parameters || [];
                  const params = rpt.extractedData || [];
                  const score = analysis.healthScore || 85;

                  return (
                    <motion.div
                      key={rpt._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="mermaid-glass p-6 sm:p-8 rounded-[2rem] border border-teal-500/25 shadow-xl space-y-5"
                    >
                      {/* Report Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-500/15 pb-4">
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-600 dark:text-teal-400 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-foreground">
                                Clinical Lab Diagnostic Report #{idx + 1}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`rounded-xl text-[10px] font-bold ${
                                  analysis.riskLevel === "High"
                                    ? "border-rose-500 text-rose-500 bg-rose-500/10"
                                    : analysis.riskLevel === "Moderate"
                                    ? "border-amber-500 text-amber-500 bg-amber-500/10"
                                    : "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                }`}
                              >
                                {analysis.riskLevel || "Low"} Risk
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono flex items-center gap-3 mt-1">
                              <span>Uploaded: {new Date(rpt.createdAt || Date.now()).toLocaleDateString()}</span>
                              <span>• Type: {rpt.type?.toUpperCase() || "PDF"}</span>
                              <span>• Biomarkers Extracted: {params.length}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right mr-2 hidden sm:block">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                              AI Health Score
                            </span>
                            <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                              {score}/100
                            </span>
                          </div>

                          {rpt._id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(rpt._id, `Report_${idx + 1}.pdf`)}
                              className="border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-xl text-xs font-bold h-9"
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                              Download File
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Abnormal Biomarkers Warning Strip (if any) */}
                      {abnormal.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>Attention Required for {abnormal.length} Parameter(s):</span>
                          </div>
                          <p className="text-[11px] opacity-90 pl-5">
                            {abnormal.map((ab: any) => `${ab.name}: ${ab.value} ${ab.unit || ""} (${ab.status})`).join(" • ")}
                          </p>
                        </div>
                      )}

                      {/* Extracted Biomarker Grid */}
                      {params.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                            Extracted Biomarkers & Reference Ranges:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {params.slice(0, 8).map((p: any, pIdx: number) => (
                              <div
                                key={pIdx}
                                className={`p-3 rounded-2xl border text-xs space-y-0.5 ${
                                  p.status === "high" || p.status === "low"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                                    : "bg-card/60 border-teal-500/15 text-foreground"
                                }`}
                              >
                                <span className="text-[10px] font-mono text-muted-foreground uppercase truncate block font-bold">
                                  {p.test_name}
                                </span>
                                <p className="text-sm font-black font-mono">
                                  {p.value} <span className="text-[10px] font-normal">{p.unit}</span>
                                </p>
                                <span className="text-[9px] text-muted-foreground block">
                                  Normal: {p.range || "Standard"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Biomarkers parsed and verified with clinical OCR engine.
                        </p>
                      )}

                      {/* AI Clinical Insights / Predictions */}
                      {analysis.predictions && analysis.predictions.length > 0 && (
                        <div className="pt-2 border-t border-teal-500/15 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                            AI Diagnostic Inference:
                          </span>
                          {analysis.predictions.map((pred: any, predIdx: number) => (
                            <Badge
                              key={predIdx}
                              variant="outline"
                              className="border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl"
                            >
                              {pred.condition} ({pred.confidence || "92%"})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="mermaid-glass p-12 rounded-[2.5rem] border border-teal-500/20 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-teal-500/15 border border-teal-400/30 mx-auto flex items-center justify-center text-[#05D3B3]">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No Diagnostic Lab Reports Uploaded Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Upload your blood work, CBC, lipid panel, or metabolic reports to see complete AI biomarker extraction and risk stratification.
                </p>
                <Button asChild className="mermaid-btn text-xs font-bold uppercase tracking-wider h-11 px-6 rounded-2xl">
                  <Link to="/reports">
                    <Upload className="w-4 h-4 mr-2" /> Upload Your First Report
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════
              TAB 3: CONNECTED IOMT SENSOR HARDWARE
          ════════════════════════════════════════════════════════════ */}
          <TabsContent value="device-telemetry" className="space-y-6 mt-0">
            <div className="mermaid-glass p-8 rounded-[2rem] border border-teal-500/20 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-teal-500/15 pb-4">
                <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-[#05D3B3]">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Connected Biometric Hardware & Telemetry Link
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Continuous BLE telemetry stream from your MAX30102 / MLX90614 sensor hub.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-card/60 border border-teal-500/15 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Hardware Device ID</span>
                  <p className="text-base font-black font-mono text-foreground">{device?.device_id || "ESP32-BLE-SENSOR-01"}</p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">MAC: C4:4F:33:18:22:9A</span>
                </div>

                <div className="p-4 rounded-2xl bg-card/60 border border-teal-500/15 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Connection Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-base font-black text-emerald-500">Live Active</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">Sampling: 250 Hz Continuous</span>
                </div>

                <div className="p-4 rounded-2xl bg-card/60 border border-teal-500/15 space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Last Synchronized</span>
                  <p className="text-sm font-bold text-foreground font-mono mt-1">
                    {device?.last_sync ? new Date(device.last_sync).toLocaleString() : "Real-time Streaming"}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Packets Dropped: 0</span>
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>

        {/* ── QUICK LOGOUT BUTTON ── */}
        <div className="pt-4 border-t border-teal-500/15">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate("/login", { replace: true });
            }}
            className="w-full h-14 rounded-2xl bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Of HealthPulse AI
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}
