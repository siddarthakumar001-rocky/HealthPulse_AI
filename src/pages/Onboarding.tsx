import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check, Loader2, Heart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { onboardingSchema } from "@/config/onboardingSchema";
import { FieldRenderer } from "@/components/FieldRenderer";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

interface OnboardingData {
  age: string; gender: string; marital_status: string; physically_handicapped: boolean;
  headache_type: string; body_pain_location: string[]; chest_pain_side: string; chest_pressure: boolean;
  stroke_history: boolean; cardiac_arrest_history: boolean;
  conditions: string[];
  on_medication: boolean; medication_details: string;
  has_bp: boolean; bp_values: string; has_sugar: boolean; sugar_values: string;
  low_energy: boolean; proper_sleep: boolean; sleep_hours: number[];
  pain_severity: string; pain_locations: string[];
  common_symptoms: string[];
  wound_scar_marks: boolean; wound_details: string; fractures: boolean; fracture_details: string;
  ent_issues: string[]; ocular_issues: string[]; ocular_family_history: boolean;
  menstrual_flow: string; cycle_duration: string; pads_per_day: string; menstrual_other_symptoms: string;
  menopausal: boolean;
  past_traumatic_history: string; surgical_history: string; medications_history: string;
  physical_exhaustion: boolean;
  smoking: string; smoking_duration: string; smoking_frequency: string;
  alcohol: string; alcohol_duration: string; alcohol_frequency: string;
  other_addictions: string;
  sexually_active: string;
  blood_investigations: string[]; imaging_done: string[];
  has_blood_report: boolean;
  diet_type: string; meals_per_day: string; food_type: string; outside_food_intake: string;
  womens_health: string;
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    age: "", gender: "", marital_status: "", physically_handicapped: false,
    headache_type: "", body_pain_location: [], chest_pain_side: "", chest_pressure: false,
    stroke_history: false, cardiac_arrest_history: false,
    conditions: [],
    on_medication: false, medication_details: "",
    has_bp: false, bp_values: "", has_sugar: false, sugar_values: "",
    low_energy: false, proper_sleep: true, sleep_hours: [7],
    pain_severity: "", pain_locations: [],
    common_symptoms: [],
    wound_scar_marks: false, wound_details: "", fractures: false, fracture_details: "",
    ent_issues: [], ocular_issues: [], ocular_family_history: false,
    menstrual_flow: "", cycle_duration: "", pads_per_day: "", menstrual_other_symptoms: "",
    menopausal: false,
    past_traumatic_history: "", surgical_history: "", medications_history: "",
    physical_exhaustion: false,
    smoking: "never", smoking_duration: "", smoking_frequency: "",
    alcohol: "never", alcohol_duration: "", alcohol_frequency: "",
    other_addictions: "",
    sexually_active: "",
    blood_investigations: [], imaging_done: [],
    has_blood_report: false,
    diet_type: "veg", meals_per_day: "3", food_type: "", outside_food_intake: "rarely",
    womens_health: "",
  });

  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadOnboarding = async () => {
      if (!user) {
        setFetching(false);
        return;
      }
      try {
        const res = await api.get("/onboarding");
        const meta = user.user_metadata || {};
        const baseData = {
          ...data,
          age: meta.age ? String(meta.age) : data.age,
          gender: meta.gender || data.gender,
        };

        if (res && Object.keys(res).length > 0) {
          setData({ ...baseData, ...res });
          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.get("mode") !== "update") {
            navigate("/dashboard");
          }
        } else {
          setData(baseData);
        }
      } catch (err) {
        console.log("No existing profile found");
      } finally {
        setFetching(false);
      }
    };
    loadOnboarding();
  }, [user, navigate]);

  const handleChange = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFinish = async () => {
    try {
      if (user) {
        await api.post("/onboarding", data);
        toast({ title: t('onboarding.complete', "Assessment complete!"), description: t('onboarding.completeDesc', "Your health profile has been updated.") });

        const { trackEvent, AnalyticsCategory, AnalyticsAction } = await import("@/lib/analytics");
        trackEvent(AnalyticsCategory.USER, AnalyticsAction.ONBOARDING_COMPLETE);

        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("mode") === "update") {
          navigate("/reports");
        } else {
          navigate("/dashboard");
        }
      } else {
        localStorage.setItem("pendingOnboarding", JSON.stringify(data));
        toast({ title: t('onboarding.saved', "Assessment saved!"), description: t('onboarding.savedDesc', "Now create your account to finish.") });
        navigate("/signup");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F8] dark:bg-[#090D16]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dynamicSteps = onboardingSchema.filter((section) => {
    if (section.condition && !section.condition(data)) return false;
    return true;
  });

  const safeStep = Math.min(step, dynamicSteps.length - 1);
  const currentSection = dynamicSteps[safeStep];
  const totalSteps = dynamicSteps.length;
  const progress = ((safeStep + 1) / totalSteps) * 100;
  const isLastStep = safeStep === totalSteps - 1;

  if (!currentSection) return null;

  return (
    <div className="relative min-h-screen w-full bg-[#F0F4F8] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <AntiGravityBackground />

      {/* Top Header Controls */}
      <header className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black tracking-wider uppercase font-display text-slate-800 dark:text-slate-100">
              HEALTH<span className="text-primary">PULSE</span> AI
            </span>
            <span className="block text-[10px] text-slate-500 font-mono">Biometric Assessment</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Glass Step Card */}
      <main className="relative z-10 w-full max-w-2xl mx-auto my-auto py-4">
        <motion.div
          key={safeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mermaid-glass p-4 sm:p-8 space-y-4 flex flex-col max-h-[82vh]"
        >
          {/* Progress Header */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="inline-flex items-center gap-1 text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> Step {safeStep + 1} of {totalSteps}
              </span>
              <span className="text-slate-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
            <div className="pt-2">
              <h2 className="text-lg sm:text-2xl font-extrabold font-display tracking-tight">
                {t(currentSection.title)}
              </h2>
              {currentSection.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(currentSection.subtitle)}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
            {currentSection.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={(data as any)[field.key]}
                onChange={handleChange}
                data={data}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={safeStep === 0}
              className="h-11 px-4 text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("common.back", "Back")}
            </Button>

            {isLastStep ? (
              <Button
                type="button"
                onClick={handleFinish}
                className="mermaid-btn h-11 px-6 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(13,148,136,0.35)]"
              >
                <Check className="h-4 w-4" /> {t("onboarding.completeBtn", "Complete Profile")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
                className="mermaid-btn h-11 px-6 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(13,148,136,0.35)]"
              >
                {t("common.next", "Next")} <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs text-slate-400 dark:text-slate-500 pb-2">
        HEALTHPULSE AI • DIGITAL TWIN BIOMETRIC ONBOARDING
      </footer>
    </div>
  );
}
