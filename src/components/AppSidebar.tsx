import {
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  User,
  Smartphone,
  LogOut,
  Heart,
  Activity,
  Building,
  Boxes,
  BrainCircuit,
  Siren,
  Sparkles,
  Stethoscope,
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
    await signOut();
    navigate("/");
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-border [&>div]:bg-[#181519] [&>div]:dark:bg-[#181519]"
        style={{
          background: "#181519",
          borderRight: "1px solid rgba(58, 47, 53, 0.6)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.2)",
          colorScheme: "dark",
        }}
      >
        <SidebarContent className="space-y-2">
          {/* Logo Header */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(227,83,54,0.15)",
                    border: "1px solid rgba(227,83,54,0.3)",
                    boxShadow: "0 0 8px rgba(227,83,54,0.25)",
                  }}
                >
                  <Activity className="h-4 w-4 text-primary" />
                </motion.div>
                {!collapsed && (
                  <span
                    className="font-display text-xs font-bold tracking-widest text-[#F5EBE6]"
                    style={{ textShadow: "0 0 8px rgba(227,83,54,0.3)" }}
                  >
                    HEALTHPULSE <span className="text-primary">AI</span>
                  </span>
                )}
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>

          {/* Group 1: Public Health Network */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] font-mono uppercase tracking-widest text-[#B5A59E]">
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
                            flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300
                            font-mono text-xs font-bold uppercase tracking-wider
                            ${isActive
                              ? "text-primary"
                              : "text-white/80 hover:text-primary hover:bg-white/5"
                            }
                          `}
                          style={isActive ? {
                            background: "rgba(227,83,54,0.15)",
                            border: "1px solid rgba(227,83,54,0.35)",
                            boxShadow: "0 0 12px rgba(227,83,54,0.25)"
                          } : {}}
                          activeClassName=""
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-white/60"}`} />
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
              <SidebarGroupLabel className="px-4 text-[10px] font-mono uppercase tracking-widest text-[#B5A59E]">
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
                            flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300
                            font-mono text-xs font-bold uppercase tracking-wider
                            ${isActive
                              ? "text-primary"
                              : "text-white/70 hover:text-primary hover:bg-white/5"
                            }
                          `}
                          style={isActive ? {
                            background: "rgba(227,83,54,0.15)",
                            border: "1px solid rgba(227,83,54,0.35)",
                            boxShadow: "0 0 12px rgba(227,83,54,0.25)"
                          } : {}}
                          activeClassName=""
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
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

        <SidebarFooter className="p-3">
          <motion.button
            onClick={() => setShowSignOutModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={`
              w-full flex items-center gap-3 rounded-xl px-3 py-2.5
              font-mono text-xs font-bold uppercase tracking-wider
              text-white/60 hover:text-red-400 transition-all duration-300
            `}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
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
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSignOut}
            className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-black"
            style={{
              background: "linear-gradient(135deg, #00f3ff, #0066ff)",
              boxShadow: "0 0 16px rgba(0,243,255,0.4)",
            }}
          >
            Confirm
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowSignOutModal(false)}
            className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white/80"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Cancel
          </motion.button>
        </div>
      </GlassModal>
    </>
  );
}
