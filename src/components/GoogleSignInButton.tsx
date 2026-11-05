import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
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
  onSuccess?: () => void;
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "363766926067-vph1ues751u8t6sjf3te9v2mcc941qr0.apps.googleusercontent.com";

export default function GoogleSignInButton({ mode = "signin", onSuccess }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    let checkInterval: any;
    const initGsi = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        setScriptLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: { credential: string }) => {
              if (!response?.credential) return;
              setLoading(true);
              try {
                const { onboarding_completed, role } = await signInWithGoogle(response.credential);
                
                // If there's pending onboarding data from anonymous step, sync it
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
                  description: t("auth.googleWelcome", "Successfully authenticated with your verified Google account."),
                });

                if (onSuccess) {
                  onSuccess();
                } else if (role === "admin") {
                  navigate("/admin/dashboard");
                } else if (onboarding_completed) {
                  navigate("/dashboard");
                } else {
                  navigate("/onboarding");
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

          // Clear previous render
          containerRef.current.innerHTML = "";
          const isDark = document.documentElement.classList.contains("dark");

          window.google.accounts.id.renderButton(containerRef.current, {
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
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [signInWithGoogle, navigate, toast, t, mode, onSuccess, i18n.language]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-2.5 px-6 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium text-xs shadow-inner animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
          <span>{t("auth.verifyingGoogle", "Verifying authentic Google account...")}</span>
        </div>
      ) : (
        <div className="w-full flex justify-center min-h-[44px]" ref={containerRef}>
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
        </div>
      )}
    </div>
  );
}
