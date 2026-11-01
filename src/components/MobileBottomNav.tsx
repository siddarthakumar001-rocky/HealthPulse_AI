import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, Stethoscope, FileText, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  isEmergency?: boolean;
}

const navItems: NavItem[] = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Twin", path: "/antigravity", icon: Activity },
  { name: "SOS", path: "/emergency", icon: ShieldAlert, isEmergency: true },
  { name: "AI Doctor", path: "/ai-suggestions", icon: Stethoscope },
  { name: "Reports", path: "/reports", icon: FileText },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-2xl border-t border-border/80 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isEmergency) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-5 flex flex-col items-center group focus:outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(239,68,68,0.45)] border-4 border-background"
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </motion.div>
                <span className="text-[10px] font-black tracking-wider text-rose-600 uppercase mt-0.5">
                  SOS
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? "font-bold text-primary" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

