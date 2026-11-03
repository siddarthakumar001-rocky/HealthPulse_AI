import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Standalone pages where the Back button should appear in the top-left corner.
  // Authenticated pages (DashboardLayout) handle back navigation directly inside their sticky header bar.
  const standalonePages = ["/login", "/signup", "/admin-login", "/onboarding"];

  if (!standalonePages.includes(location.pathname)) {
    return null;
  }

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="fixed top-5 left-5 sm:top-6 sm:left-6 z-50 print:hidden pointer-events-auto">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow backdrop-blur-md text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        title="Return to Home"
        aria-label="Return to Home"
      >
        <ArrowLeft className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <span className="tracking-wider uppercase">Back to Home</span>
      </button>
    </div>
  );
}
