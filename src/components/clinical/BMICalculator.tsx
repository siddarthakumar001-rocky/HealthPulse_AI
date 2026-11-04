import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scale,
  Activity,
  Heart,
  Flame,
  Droplets,
  Apple,
  Dumbbell,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export interface BMICalculationResult {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  categoryLabel: string;
  categoryColor: string;
  healthyWeightMin: number;
  healthyWeightMax: number;
  weightDelta: number;
  bmr: number;
  tdee: number;
  waterIntakeLiters: number;
  riskProfile: string;
  recommendations: {
    diet: string[];
    exercise: string[];
    lifestyle: string[];
  };
}

export function BMICalculator() {
  const { user } = useAuth();

  // Unit System
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Inputs
  const [heightCm, setHeightCm] = useState<number>(() => {
    const saved = localStorage.getItem("healthpulse_user_height");
    return saved ? Number(saved) : 172;
  });
  const [weightKg, setWeightKg] = useState<number>(() => {
    const saved = localStorage.getItem("healthpulse_user_weight");
    return saved ? Number(saved) : 68;
  });

  // Imperial helper states
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  const [weightLbs, setWeightLbs] = useState(150);

  const [age, setAge] = useState<number>(() => {
    const userAge = Number(user?.user_metadata?.age);
    return userAge > 0 ? userAge : 24;
  });
  const [gender, setGender] = useState<"male" | "female">(() => {
    const g = (user?.user_metadata?.biological_sex || user?.user_metadata?.gender || "").toLowerCase();
    return g.includes("female") ? "female" : "male";
  });
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active">("moderate");
  const [saving, setSaving] = useState(false);

  // Sync imperial to metric
  useEffect(() => {
    if (unitSystem === "imperial") {
      const totalInches = heightFeet * 12 + heightInches;
      const cm = Math.round(totalInches * 2.54);
      setHeightCm(cm);
      setWeightKg(Math.round(weightLbs * 0.453592 * 10) / 10);
    }
  }, [heightFeet, heightInches, weightLbs, unitSystem]);

  // Sync metric to imperial
  const switchToImperial = () => {
    const totalInches = heightCm / 2.54;
    setHeightFeet(Math.floor(totalInches / 12));
    setHeightInches(Math.round(totalInches % 12));
    setWeightLbs(Math.round(weightKg * 2.20462));
    setUnitSystem("imperial");
  };

  const switchToMetric = () => {
    setUnitSystem("metric");
  };

  // Perform Clinical Calculation
  const calculateMetrics = (): BMICalculationResult => {
    const heightM = heightCm / 100;
    const bmiRaw = heightM > 0 ? weightKg / (heightM * heightM) : 0;
    const bmi = Math.round(bmiRaw * 10) / 10;

    let category: BMICalculationResult["category"] = "normal";
    let categoryLabel = "Optimal Normal Weight";
    let categoryColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    let riskProfile = "Minimal cardiometabolic risk associated with current body mass index.";

    if (bmi < 18.5) {
      category = "underweight";
      categoryLabel = "Underweight";
      categoryColor = "text-blue-500 bg-blue-500/10 border-blue-500/30";
      riskProfile = "Risk of nutritional deficiency, reduced bone density, and decreased muscle mass.";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "overweight";
      categoryLabel = "Overweight";
      categoryColor = "text-amber-500 bg-amber-500/10 border-amber-500/30";
      riskProfile = "Moderate risk of insulin resistance, elevated blood pressure, and joint strain.";
    } else if (bmi >= 30) {
      category = "obese";
      categoryLabel = bmi >= 35 ? "Severe Obesity" : "Obesity Class I";
      categoryColor = "text-rose-500 bg-rose-500/10 border-rose-500/30";
      riskProfile = "Significant cardiovascular strain, increased risk of Type-2 diabetes and hypertension.";
    }

    const healthyWeightMin = Math.round(18.5 * heightM * heightM * 10) / 10;
    const healthyWeightMax = Math.round(24.9 * heightM * heightM * 10) / 10;

    let weightDelta = 0;
    if (weightKg > healthyWeightMax) {
      weightDelta = Math.round((weightKg - healthyWeightMax) * 10) / 10;
    } else if (weightKg < healthyWeightMin) {
      weightDelta = Math.round((weightKg - healthyWeightMin) * 10) / 10;
    }

    // Mifflin-St Jeor BMR Equation
    const bmr = Math.round(
      gender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    );

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    const waterIntakeLiters = Math.round((weightKg * 0.035) * 10) / 10;

    // Tailored Recommendations
    const recommendations = {
      underweight: {
        diet: [
          "Nutrient-dense caloric surplus: nuts, nut butters, avocados, and whole grains.",
          "Adequate lean protein (1.2–1.5g per kg) to support muscle synthesis.",
          "Eat small, frequent meals every 3–4 hours.",
        ],
        exercise: [
          "Focus on progressive resistance and strength training to build lean muscle.",
          "Limit excessive endurance cardio to prevent further calorie deficit.",
        ],
        lifestyle: [
          "Prioritize 8+ hours of sleep for cellular repair and hormonal balance.",
          "Evaluate micronutrient levels (Vitamin D, B12, Iron ferritin).",
        ],
      },
      normal: {
        diet: [
          "Balanced macronutrient split: 45% complex carbs, 30% healthy fats, 25% protein.",
          "Maintain diverse colorful seasonal vegetables and fiber-rich legumes.",
          "Keep refined sugar and high-sodium ultra-processed snacks to a minimum.",
        ],
        exercise: [
          "150 minutes of moderate aerobic activity weekly (brisk walking, cycling, swimming).",
          "2–3 full-body resistance training sessions weekly to maintain muscle tone.",
        ],
        lifestyle: [
          "Stay consistently hydrated throughout waking hours.",
          "Annual preventive blood pressure and lipid monitoring.",
        ],
      },
      overweight: {
        diet: [
          "Moderate caloric deficit (300–400 kcal below maintenance TDEE).",
          "Prioritize high-satiety protein and dietary fiber (cruciferous greens, oats).",
          "Eliminate sugary beverages and liquid calories.",
        ],
        exercise: [
          "Increase non-exercise activity thermogenesis (NEAT): 8,000–10,000 steps daily.",
          "Low-impact resistance training and zone-2 cardio to spare joint cartilage.",
        ],
        lifestyle: [
          "Track intermittent fasting or 12-hour nighttime fasting window (7 PM to 7 AM).",
          "Monitor resting heart rate and blood glucose every 6 months.",
        ],
      },
      obese: {
        diet: [
          "Clinically supervised gradual caloric adjustment (-500 kcal/day).",
          "Anti-inflammatory Mediterranean or whole-food plant-forward dietary pattern.",
          "Ensure high hydration (min 3.0 liters) to assist metabolic excretion.",
        ],
        exercise: [
          "Joint-safe low-impact conditioning: water aerobics, recumbent cycling, brisk walking.",
          "Break exercise into 15-minute intervals twice daily.",
        ],
        lifestyle: [
          "Consult with a physician or clinical nutritionist for metabolic screening (HbA1c, lipid panel).",
          "Screen for obstructive sleep apnea if daytime fatigue or snoring is present.",
        ],
      },
    }[category];

    return {
      bmi,
      category,
      categoryLabel,
      categoryColor,
      healthyWeightMin,
      healthyWeightMax,
      weightDelta,
      bmr,
      tdee,
      waterIntakeLiters,
      riskProfile,
      recommendations,
    };
  };

  const results = calculateMetrics();

  const handleSaveToProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem("healthpulse_user_height", String(heightCm));
      localStorage.setItem("healthpulse_user_weight", String(weightKg));
      localStorage.setItem("healthpulse_user_bmi", String(results.bmi));

      // Asynchronously update backend onboarding profile if authenticated
      if (user) {
        await api.post("/onboarding", {
          height: heightCm,
          weight: weightKg,
          bmi: results.bmi,
          activity_level: activityLevel,
        }).catch(() => null);
      }

      toast.success("Height, Weight & BMI saved to your HealthPulse Profile!");
    } catch (err) {
      toast.error("Failed to save metrics.");
    } finally {
      setSaving(false);
    }
  };

  // Range bar positioning (range from 15 to 40)
  const clampPercent = Math.min(100, Math.max(0, ((results.bmi - 15) / (40 - 15)) * 100));

  return (
    <div className="space-y-6">
      {/* ── HEADER CARD ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-foreground flex items-center gap-2">
              Clinical BMI & Body Health Analyzer
              <Badge variant="outline" className="text-[10px] font-mono border-teal-500/40 text-teal-600 dark:text-teal-400">
                WHO Standard
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Real-time body mass analysis, metabolic expenditure, and personalized clinical suggestions
            </p>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant={unitSystem === "metric" ? "default" : "ghost"}
            size="sm"
            onClick={switchToMetric}
            className="h-7 sm:h-8 px-3 rounded-xl text-xs font-mono font-bold"
          >
            Metric (cm, kg)
          </Button>
          <Button
            type="button"
            variant={unitSystem === "imperial" ? "default" : "ghost"}
            size="sm"
            onClick={switchToImperial}
            className="h-7 sm:h-8 px-3 rounded-xl text-xs font-mono font-bold"
          >
            Imperial (ft, lbs)
          </Button>
        </div>
      </div>

      {/* ── MAIN INTERACTIVE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Inputs Cockpit (5 cols) */}
        <Card className="lg:col-span-5 bg-card border border-border shadow-md rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Patient Physical Attributes
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">Adjust sliders or inputs</span>
          </div>

          <div className="space-y-4">
            {/* Height Input */}
            {unitSystem === "metric" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <Label htmlFor="height-cm" className="font-bold">Height</Label>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">{heightCm} cm ({((heightCm / 2.54) / 12).toFixed(1)} ft)</span>
                </div>
                <Input
                  id="height-cm"
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(80, Math.min(250, Number(e.target.value) || 160)))}
                  className="rounded-xl h-10 font-mono text-xs"
                />
                <input
                  type="range"
                  min={120}
                  max={220}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <Label className="font-bold">Height (Feet & Inches)</Label>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">{heightFeet} ft {heightInches} in ({heightCm} cm)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={3}
                    max={7}
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Number(e.target.value) || 5)}
                    placeholder="Feet"
                    className="rounded-xl h-10 font-mono text-xs"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value) || 0)}
                    placeholder="Inches"
                    className="rounded-xl h-10 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Weight Input */}
            {unitSystem === "metric" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <Label htmlFor="weight-kg" className="font-bold">Weight</Label>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">{weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)</span>
                </div>
                <Input
                  id="weight-kg"
                  type="number"
                  step="0.5"
                  min={30}
                  max={220}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(25, Math.min(250, Number(e.target.value) || 60)))}
                  className="rounded-xl h-10 font-mono text-xs"
                />
                <input
                  type="range"
                  min={35}
                  max={150}
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <Label htmlFor="weight-lbs" className="font-bold">Weight</Label>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">{weightLbs} lbs ({weightKg} kg)</span>
                </div>
                <Input
                  id="weight-lbs"
                  type="number"
                  min={60}
                  max={450}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value) || 130)}
                  className="rounded-xl h-10 font-mono text-xs"
                />
              </div>
            )}

            {/* Age & Gender Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label htmlFor="user-age" className="text-xs font-mono">Age (Years)</Label>
                <Input
                  id="user-age"
                  type="number"
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Math.max(5, Math.min(110, Number(e.target.value) || 25)))}
                  className="rounded-xl h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Biological Sex</Label>
                <div className="flex rounded-xl bg-muted p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 text-xs py-1 rounded-lg font-bold ${
                      gender === "male" ? "bg-teal-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 text-xs py-1 rounded-lg font-bold ${
                      gender === "female" ? "bg-teal-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <Label className="text-xs font-mono flex items-center justify-between">
                <span>Daily Physical Activity</span>
                <span className="text-[10px] text-muted-foreground capitalize font-bold">{activityLevel}</span>
              </Label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                {[
                  { id: "sedentary", label: "Sedentary (Desk Job)" },
                  { id: "light", label: "Light (1-3 days/wk)" },
                  { id: "moderate", label: "Moderate (3-5 days)" },
                  { id: "active", label: "Active (6-7 days/wk)" },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      activityLevel === act.id
                        ? "bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-400 font-bold shadow-sm"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="button"
              onClick={handleSaveToProfile}
              disabled={saving}
              className="w-full h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mt-3"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving to HealthPulse..." : "Save Height & Weight to Profile"}</span>
            </Button>
          </div>
        </Card>

        {/* Right Col: Instant Clinical Analysis & Gauge (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* BMI Result Hero Card */}
          <Card className="bg-card border border-border shadow-md rounded-3xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Body Mass Index (BMI)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-foreground">
                    {results.bmi}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">kg/m²</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <Badge className={`text-xs px-3 py-1 font-bold uppercase tracking-wider border ${results.categoryColor}`}>
                  {results.categoryLabel}
                </Badge>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">
                  WHO standard reference
                </p>
              </div>
            </div>

            {/* Spectrum Range Bar */}
            <div className="mt-6 space-y-2">
              <div className="relative h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div className="h-full bg-blue-500 w-[14%]" title="Underweight (< 18.5)" />
                <div className="h-full bg-emerald-500 w-[25.6%]" title="Normal (18.5 - 24.9)" />
                <div className="h-full bg-amber-500 w-[20%]" title="Overweight (25 - 29.9)" />
                <div className="h-full bg-rose-500 flex-1" title="Obese (>= 30)" />
              </div>

              {/* Indicator Arrow */}
              <div className="relative w-full h-6">
                <div
                  className="absolute -top-1.5 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${clampPercent}%` }}
                >
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-foreground" />
                  <span className="text-[10px] font-mono font-bold text-foreground bg-background px-1.5 py-0.5 rounded shadow-sm border border-border">
                    {results.bmi}
                  </span>
                </div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
                <span>&lt;18.5 (Under)</span>
                <span>18.5–24.9 (Normal)</span>
                <span>25–29.9 (Over)</span>
                <span>30+ (Obese)</span>
              </div>
            </div>

            {/* Healthy Range & Delta Note */}
            <div className="mt-5 p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Optimal Weight Range for {heightCm} cm:
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {results.healthyWeightMin} kg – {results.healthyWeightMax} kg ({Math.round(results.healthyWeightMin * 2.20462)}–{Math.round(results.healthyWeightMax * 2.20462)} lbs)
                </span>
              </div>

              <div className="text-left sm:text-right">
                {results.weightDelta === 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" /> Inside Optimal Range
                  </span>
                ) : results.weightDelta > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    +{results.weightDelta} kg above normal range
                  </span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {results.weightDelta} kg below normal range
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Metabolic & Energy Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* BMR */}
            <Card className="p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] uppercase font-mono font-bold">Basal Metabolic Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-display text-foreground">{results.bmr}</span>
                <span className="text-[10px] font-mono text-muted-foreground">kcal/day</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Base calories burned at complete rest
              </p>
            </Card>

            {/* TDEE */}
            <Card className="p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="w-4 h-4 text-teal-500" />
                <span className="text-[10px] uppercase font-mono font-bold">Daily Expenditure</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-display text-teal-600 dark:text-teal-400">{results.tdee}</span>
                <span className="text-[10px] font-mono text-muted-foreground">kcal/day</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Maintenance calories with activity
              </p>
            </Card>

            {/* Hydration */}
            <Card className="p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] uppercase font-mono font-bold">Daily Hydration</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-display text-blue-600 dark:text-blue-400">{results.waterIntakeLiters}</span>
                <span className="text-[10px] font-mono text-muted-foreground">liters/day</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Target minimum water intake
              </p>
            </Card>
          </div>

          {/* Clinical Suggestions & AI Recommendations */}
          <Card className="bg-card border border-border shadow-md rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Personalized Clinical Suggestions for BMI {results.bmi}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {results.riskProfile}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60 text-xs">
              {/* Dietary Strategy */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5" /> Dietary Strategy
                </span>
                <ul className="space-y-1.5 text-muted-foreground">
                  {results.recommendations.diet.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-teal-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical Activity Plan */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Physical Activity Plan
                </span>
                <ul className="space-y-1.5 text-muted-foreground">
                  {results.recommendations.exercise.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-teal-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BMICalculator;
