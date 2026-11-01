import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, ArrowRight, User, Mail, Phone, ShieldCheck, Lock, Activity, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { api } from "../services/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", age: "", gender: "", password: "", emergencyContact: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        name: form.name,
        phone: form.phone,
        age: parseInt(form.age),
        gender: form.gender,
        emergency_contact: form.emergencyContact,
      });

      const pending = localStorage.getItem("pendingOnboarding");
      if (pending) {
        try {
          const onboardingData = JSON.parse(pending);
          await api.post("/onboarding", onboardingData);
          localStorage.removeItem("pendingOnboarding");
          toast({ title: t("onboarding.complete", "Profile Complete"), description: t("onboarding.completeDesc", "Your profile synced successfully.") });
        } catch (onboardErr) {
          console.error("Failed to sync onboarding:", onboardErr);
        }
      } else {
        toast({ title: t("signup.successTitle", "Account Created!"), description: t("signup.successDesc", "Welcome to HealthPulse AI.") });
      }

      navigate("/onboarding");
    } catch (err: any) {
      console.error("Signup failed:", err.message);
      toast({ title: t("signup.failed", "Signup failed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <AntiGravityBackground />

      {/* Top HUD Controls */}
      <header className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-between pt-2">
        <Link
          to="/"
          className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-foreground hover:bg-white shadow-sm transition active:scale-95"
          title="Return to Home"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/80" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Center Form Card */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "out" }}
          className="antigravity-card p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
              <Heart className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              <ShieldCheck className="w-3 h-3" /> Digital Twin Profile Setup
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              {t("signup.title", "Create Account")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t("signup.subtitle", "Start monitoring your vitals with AI intelligence")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("signup.fullName", "Full Name")}
                </Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    className="antigravity-input pl-10 h-11 text-sm font-medium"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("login.email", "Email Address")}
                </Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="email"
                    className="antigravity-input pl-10 h-11 text-sm font-medium"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("signup.phone", "Phone Number")}
                </Label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    className="antigravity-input pl-10 h-11 text-sm font-medium"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("onboarding.age", "Age")}
                </Label>
                <Input
                  type="number"
                  className="antigravity-input h-11 text-sm font-medium px-4"
                  placeholder="Enter age"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("onboarding.gender", "Gender")}
                </Label>
                <Select onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="antigravity-input h-11 text-sm font-medium px-4">
                    <SelectValue placeholder={t("common.select", "Select Gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">{t("onboarding.female", "Female")}</SelectItem>
                    <SelectItem value="male">{t("onboarding.male", "Male")}</SelectItem>
                    <SelectItem value="other">{t("onboarding.other", "Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {t("signup.emergencyContact", "Emergency Contact")}
                </Label>
                <Input
                  className="antigravity-input h-11 text-sm font-medium px-4"
                  placeholder="Emergency phone number"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t("login.password", "Password")}
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="antigravity-input pl-10 pr-12 h-11 text-sm font-medium"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="antigravity-btn w-full h-12 text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  {t("signup.creating", "Creating Account...")}
                </>
              ) : (
                <>
                  {t("signup.createBtn", "Create Account")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {t("signup.haveAccount", "Already have an account?")}{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t("login.signInBtn", "Sign In")}
            </Link>
          </p>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs text-slate-400 dark:text-slate-500 pb-2">
        HEALTHPULSE AI • BIOMETRIC TELEMETRY & DIGITAL TWIN
      </footer>
    </div>
  );
}
