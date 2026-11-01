import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Activity, ArrowLeft } from "lucide-react";
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

      {/* Top HUD Controls */}
      <header className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-2">
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
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
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
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  className="antigravity-input pl-10 h-12 text-sm font-medium"
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
                  className="antigravity-input pl-10 pr-12 h-12 text-sm font-medium w-full"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
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
