import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, PhoneCall, ShieldAlert, ArrowRight, HeartPulse, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
  getEmergencyContact?: () => { phone?: string; name?: string };
  onSuccess?: () => void;
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "363766926067-vph1ues751u8t6sjf3te9v2mcc941qr0.apps.googleusercontent.com";

export default function GoogleSignInButton({
  mode = "signin",
  getEmergencyContact,
  onSuccess,
}: GoogleSignInButtonProps) {
  // Dedicated empty container for GIS to prevent React removeChild DOM conflicts
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Emergency contact modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    onboarding_completed: boolean;
    role: string;
  } | null>(null);

  const { signInWithGoogle, updateEmergencyContact } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const handlePostAuthRouting = (role: string, onboarding_completed: boolean) => {
    if (onSuccess) {
      onSuccess();
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (onboarding_completed) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  useEffect(() => {
    let checkInterval: any;
    let isMounted = true;

    const initGsi = () => {
      if (!isMounted) return;
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        setScriptLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: { credential: string }) => {
              if (!response?.credential) return;
              setLoading(true);
              try {
                // If caller provided emergency contact upfront, pass it
                const prefilled = getEmergencyContact ? getEmergencyContact() : undefined;
                const authResult = await signInWithGoogle(
                  response.credential,
                  prefilled?.phone,
                  prefilled?.name
                );

                // Sync pending onboarding if exists
                const pending = localStorage.getItem("pendingOnboarding");
                if (pending) {
                  try {
                    const onboardingData = JSON.parse(pending);
                    await api.post("/onboarding", onboardingData);
                    localStorage.removeItem("pendingOnboarding");
                  } catch (e) {
                    console.error("Failed to sync pending onboarding:", e);
                  }
                }

                toast({
                  title: t("auth.googleSuccess", "Google Account Verified"),
                  description: t(
                    "auth.googleWelcome",
                    "Authenticated with your verified Google account."
                  ),
                });

                // Check if emergency contact is strictly required
                if (authResult.requires_emergency_contact && (!prefilled?.phone || prefilled.phone.length < 5)) {
                  setPendingNavigation({
                    role: authResult.role,
                    onboarding_completed: authResult.onboarding_completed,
                  });
                  setShowEmergencyModal(true);
                } else {
                  handlePostAuthRouting(authResult.role, authResult.onboarding_completed);
                }
              } catch (err: any) {
                console.error("Google Auth error:", err);
                const errorMsg =
                  err?.response?.data?.error ||
                  err?.message ||
                  t("auth.googleFailed", "Google sign-in could not be completed.");
                toast({
                  title: t("auth.authError", "Authentication Failed"),
                  description: errorMsg,
                  variant: "destructive",
                });
              } finally {
                setLoading(false);
              }
            },
          });

          // Render official GIS button into the clean container
          const isDark = document.documentElement.classList.contains("dark");
          buttonContainerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: "standard",
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: 320,
            locale: i18n.language || "en",
          });
        } catch (e) {
          console.error("Error initializing Google Identity Services:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        }
      }, 300);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [signInWithGoogle, getEmergencyContact, t, mode, i18n.language]);

  const handleSaveEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyPhone || emergencyPhone.trim().length < 5) {
      toast({
        title: "Emergency Contact Required",
        description: "Please enter a valid emergency contact phone number.",
        variant: "destructive",
      });
      return;
    }

    setSavingContact(true);
    try {
      await updateEmergencyContact(emergencyPhone.trim(), emergencyName.trim());
      toast({
        title: "Emergency Protocol Registered",
        description: "Your emergency contact is now secured for IoMT vital telemetry.",
      });
      setShowEmergencyModal(false);
      if (pendingNavigation) {
        handlePostAuthRouting(pendingNavigation.role, pendingNavigation.onboarding_completed);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Could not register emergency contact.",
        variant: "destructive",
      });
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-2.5 px-6 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium text-xs shadow-inner animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
          <span>{t("auth.verifyingGoogle", "Verifying authentic Google account...")}</span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Skeleton placeholder shown ONLY before script loads */}
          {!scriptLoaded && (
            <div className="h-10 w-full max-w-[320px] rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t("auth.loadingGoogle", "Connecting to Google...")}</span>
            </div>
          )}

          {/* Dedicated container strictly for GIS button iframe (No React children inside) */}
          <div
            ref={buttonContainerRef}
            className={`w-full flex justify-center min-h-[44px] ${!scriptLoaded ? "hidden" : ""}`}
          />
        </div>
      )}

      {/* Emergency Contact Modal (Mandatory for Google Users) */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white dark:bg-[#0B1220] border border-amber-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <HeartPulse className="w-3 h-3" /> Clinical Safety Protocol
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Emergency Contact Required
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Under IoMT vital telemetry standards, an emergency contact is mandatory so health alarms and distress signals can reach your loved ones or doctor instantly.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEmergencyContact} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="emergency-phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Emergency Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                    <Input
                      id="emergency-phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="antigravity-input pl-10 h-11 text-sm font-medium w-full border-amber-500/30 focus:border-amber-500"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergency-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Contact Name & Relationship (Optional)
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="emergency-name"
                      type="text"
                      placeholder="e.g. Father, Spouse, or Dr. Sharma"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="antigravity-input pl-10 h-11 text-sm font-medium w-full"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={savingContact || !emergencyPhone.trim()}
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-teal-600 hover:from-amber-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 transition"
                >
                  {savingContact ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering Protocol...
                    </>
                  ) : (
                    <>
                      Save Contact & Proceed
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
