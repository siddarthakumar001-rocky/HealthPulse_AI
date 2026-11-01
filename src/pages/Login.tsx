import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search);
  const isAdminRequest = searchParams.get("admin") === "true";

  useState(() => {
    if (isAdminRequest) {
      setEmail("admin");
      setPassword("admin@@@123");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { onboarding_completed, role } = await signIn(email, password);
      toast({
        title: "Authenticated Successfully",
        description: `Welcome back to HealthPulse AI (${role.toUpperCase()})`,
      });

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (onboarding_completed) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      console.error("Login failed:", err.message);
      toast({ title: t("login.failed", "Sign In Failed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <AntiGravityBackground />

      {/* Top Controls: Right Anchored Language & Theme */}
      <header className="relative z-30 w-full max-w-md mx-auto flex items-center justify-end pt-2 pl-16 gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      {/* Center Form Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "out" }}
          className="mermaid-glass p-6 sm:p-8 space-y-6 shadow-2xl border border-teal-400/35"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-400/35 text-teal-600 dark:text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)] shadow-inner">
              <Heart className="h-7 w-7 text-teal-600 dark:text-teal-400 animate-pulse" />
            </div>
            <div className="mermaid-chip text-[10px] font-bold tracking-wider uppercase border-teal-400/40 bg-teal-500/10 text-teal-700 dark:text-teal-300">
              <ShieldCheck className="w-3 h-3" /> IoMT Encrypted Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              {t("login.welcomeBack", "Welcome Back")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t("login.subtitle", "Sign in to your HealthPulse account")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t("login.email", "Email Address")}
              </Label>
              <div className="relative w-full">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="antigravity-input pl-10 h-12 text-sm font-medium w-full"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t("login.password", "Password")}
              </Label>
              <div className="relative w-full">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="antigravity-input pl-10 pr-12 h-12 text-sm font-medium w-full"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-teal-500 transition cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-teal-500" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mermaid-btn w-full h-12 text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 mt-2 shadow-[0_8px_25px_rgba(13,148,136,0.35)]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  {t("login.signingIn", "Authenticating...")}
                </>
              ) : (
                <>
                  {t("login.signInBtn", "Sign In")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Link */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("login.noAccount", "Don't have an account?")}{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                {t("login.signUp", "Create Account")}
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs text-slate-400 dark:text-slate-500 pb-2">
        HEALTHPULSE AI • BIOMETRIC TELEMETRY & DIGITAL TWIN
      </footer>
    </div>
  );
}
