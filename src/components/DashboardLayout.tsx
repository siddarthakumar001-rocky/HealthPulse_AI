import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import CursorTrail from "@/components/dashboard/CursorTrail";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const addRipple = (e: React.MouseEvent) => {
    const id = Date.now();
    setRipples((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <SidebarProvider>
      <div onClick={addRipple} className="relative w-full h-full">
        {/* Global ripple effect */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple"
            style={{ left: ripple.x - 20, top: ripple.y - 20, width: 40, height: 40 }}
          />
        ))}

        <CursorTrail />

        <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0">
            {/* ── GLASS HEADER ──────────────────────────────────── */}
            <header
              className="sticky top-0 z-40 flex h-16 items-center justify-between px-3 sm:px-6 transition-all duration-300 bg-background/90 border-b border-border/80"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Left: sidebar trigger */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <SidebarTrigger
                  className="text-foreground/90 hover:text-primary transition-colors h-10 w-10 min-h-[44px] min-w-[44px]"
                />
              </motion.div>

              {/* Right: actions */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <LanguageSwitcher />
                <ThemeToggle />

                {/* Bell icon */}
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-full w-9 h-9 min-h-[36px] min-w-[36px] text-foreground/70 hover:text-primary transition-colors bg-card border border-border"
                  >
                    <Link to="/alerts">
                      <Bell className="h-4 w-4 text-foreground/80" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-sm font-bold cursor-pointer font-mono"
                  style={{
                    background: "linear-gradient(135deg, #E35336 0%, #FF7E67 100%)",
                    border: "1px solid rgba(227,83,54,0.4)",
                    boxShadow: "0 2px 10px rgba(227,83,54,0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  {user?.user_metadata?.name?.[0]?.toUpperCase() || "U"}
                </motion.div>
              </div>
            </header>

            {/* ── PAGE CONTENT ──────────────────────────────────── */}
            <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    mass: 0.8,
                  }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}


