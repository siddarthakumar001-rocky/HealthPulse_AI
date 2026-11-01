import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";
import { Bell, Moon, Sun, User, LogOut, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import CursorTrail from "@/components/dashboard/CursorTrail";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AntiGravityBackground } from "@/components/AntiGravityBackground";
import { useScrollFlow } from "@/hooks/useScrollFlow";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { isScrolled } = useScrollFlow(10);
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
        <AntiGravityBackground />

        <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0">
            {/* ── GLASS HEADER ──────────────────────────────────── */}
            <header
              className={`sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 pt-[env(safe-area-inset-top)] ${isScrolled ? "h-14 bg-background/95 border-b border-primary/20 shadow-md backdrop-blur-2xl" : "h-16 bg-background/80 border-b border-border/80 shadow-none backdrop-blur-xl"}`}
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

                {/* Interactive Profile Avatar & User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-sm font-bold cursor-pointer font-mono outline-none shadow-md transition-transform"
                      style={{
                        background: 'linear-gradient(135deg, #05D3B3 0%, #0D9488 100%)',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 2px 12px rgba(13,148,136,0.35)',
                        color: '#FFFFFF',
                      }}
                      title="User Profile Menu"
                    >
                      {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-60 p-2 rounded-2xl mermaid-glass shadow-2xl border border-white/20 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {user?.user_metadata?.name || 'Patient Account'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {user?.email || 'patient@healthpulse.ai'}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl cursor-pointer hover:bg-teal-500/15 transition-colors"
                    >
                      <User className="w-4 h-4 text-teal-500" />
                      <span>{t('nav.profile', 'My Profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl cursor-pointer hover:bg-teal-500/15 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-teal-500" />
                      <span>{t('nav.dashboard', 'Dashboard')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuItem
                      onClick={async () => {
                        await signOut();
                        navigate('/login', { replace: true });
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.signOut', 'Log Out')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* ── PAGE CONTENT ──────────────────────────────────── */}
            <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0 pb-28 md:pb-8">
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
      <MobileBottomNav />
    </SidebarProvider>
  );
}


