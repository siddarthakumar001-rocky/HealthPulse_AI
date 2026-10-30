import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Hide on Landing page or Admin views
  if (location.pathname === "/" || location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleBack = () => {
    // 1. Auth pages: Always take the user back to Landing page ("/")
    if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/admin-login"
    ) {
      navigate("/");
      return;
    }

    // 2. Main Dashboard: Return to Landing page ("/")
    if (location.pathname === "/dashboard") {
      navigate("/");
      return;
    }

    // 3. For any other inner page:
    // Check if there is active history within this browser session
    const hasHistory =
      typeof window !== "undefined" &&
      Boolean(window.history?.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0);

    if (hasHistory) {
      navigate(-1);
    } else {
      // Safe fallback based on session state
      navigate(user ? "/dashboard" : "/");
    }
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      size="icon" 
      onClick={handleBack} 
      className="fixed bottom-6 right-6 z-[9999] rounded-full shadow-premium bg-background/80 backdrop-blur-md hover:scale-105 active:scale-95 transition-all w-12 h-12 border-primary/20 cursor-pointer pointer-events-auto"
      title="Go back"
      aria-label="Go back"
    >
      <ArrowLeft className="h-6 w-6 text-primary" />
    </Button>
  );
}
