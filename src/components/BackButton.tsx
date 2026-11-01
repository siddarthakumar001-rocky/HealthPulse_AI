import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Hide on Landing page or main Dashboard root where top/bottom nav handles context
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  const handleBack = () => {
    if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/admin-login" ||
      location.pathname === "/onboarding"
    ) {
      navigate("/");
      return;
    }

    const hasHistory =
      typeof window !== "undefined" &&
      Boolean(window.history?.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0);

    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(user ? "/dashboard" : "/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed top-4 left-4 z-40 w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all pointer-events-auto"
      title="Go back"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5 text-primary" />
    </button>
  );
}
