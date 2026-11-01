import {
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  User,
  Smartphone,
  LogOut,
  Activity,
  Building,
  Boxes,
  BrainCircuit,
  Siren,
  Stethoscope,
  FlaskConical,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import GlassModal from "@/components/GlassModal";
import { useState } from "react";

const personalNavItems = [
  { key: "dashboard", defaultLabel: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "myVitals", defaultLabel: "My Vitals", url: "/device-connect", icon: Smartphone },
  { key: "healthReports", defaultLabel: "Health Reports", url: "/reports", icon: FileText },
  { key: "aiSuggestions", defaultLabel: "AI Suggestions", url: "/ai-suggestions", icon: Stethoscope },
  { key: "emergencyAlerts", defaultLabel: "Emergency Alerts", url: "/alerts", icon: Bell },
  { key: "researchEval", defaultLabel: "Research Evaluation", url: "/research-evaluation", icon: FlaskConical },
  { key: "healthcareMap", defaultLabel: "Healthcare Map", url: "/map", icon: Map },
  { key: "profile", defaultLabel: "Profile", url: "/profile", icon: User },
];

const publicHealthNavItems = [
  { key: "phcCommand", defaultLabel: "PHC Command Hub", url: "/phc-command", icon: Building },
  { key: "supplyChain", defaultLabel: "Supply Chain & IoT", url: "/supply-chain", icon: Boxes },
  { key: "aiForecasting", defaultLabel: "AI Demand & Outbreak", url: "/ai-forecasting", icon: BrainCircuit },
  { key: "emergencyHub", defaultLabel: "Emergency Incident Hub", url: "/emergency", icon: Siren },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl"
      >
        <SidebarContent className="space-y-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* Logo Header */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm"
                >
                  <Activity className="h-4 w-4 text-primary" />
                </motion.div>
                {!collapsed && (
                  <span className="font-display text-sm font-extrabold tracking-wider text-slate-900 dark:text-white uppercase">
                    HEALTH<span className="text-primary">PULSE</span> AI
                  </span>
                )}
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>

          {/* Group 1: Public Health Network */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t("nav.publicHealthNetwork", "Public Health Network")}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {publicHealthNavItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  const label = t(`nav.${item.key}`, item.defaultLabel);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className={`
                            flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                            font-sans text-xs font-bold uppercase tracking-wide
                            ${isActive
                              ? "bg-primary/10 text-primary border border-primary/20 font-extrabold shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                            }
                          `}
                          activeClassName=""
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                          {!collapsed && <span>{label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Group 2: Personal Healthcare */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t("nav.personalHealthcare", "Personal Healthcare")}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {personalNavItems.map((item) => {
                  const isActive = location.pathname === item.url ||
                    (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                  const label = t(`nav.${item.key}`, item.defaultLabel);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className={`
                            flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                            font-sans text-xs font-bold uppercase tracking-wide
                            ${isActive
                              ? "bg-primary/10 text-primary border border-primary/20 font-extrabold shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                            }
                          `}
                          activeClassName=""
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                          {!collapsed && <span>{label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <motion.button
            onClick={() => setShowSignOutModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("nav.signOut", "Sign Out")}</span>}
          </motion.button>
        </SidebarFooter>
      </Sidebar>

      {/* Sign Out confirmation modal */}
      <GlassModal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title={t("nav.signOut", "SIGN OUT")}
        description="Are you sure you want to end your session?"
      >
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSignOut();
            }}
            className="flex-1 py-3 rounded-xl font-sans text-xs font-extrabold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md z-30 cursor-pointer pointer-events-auto"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSignOutModal(false);
            }}
            className="flex-1 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all z-30 cursor-pointer pointer-events-auto"
          >
            Cancel
          </button>
        </div>
      </GlassModal>
    </>
  );
}
