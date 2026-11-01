import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { phcService, PHCAlertItem } from "@/services/phcService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  LifeBuoy,
  Pill,
  Radio,
  RefreshCw,
  ShieldAlert,
  Siren,
  Snowflake,
  Stethoscope,
  Truck,
  Users,
  Zap,
} from "lucide-react";

export default function EmergencyIntelligence() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<PHCAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<PHCAlertItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await phcService.getAlerts();
      if (res?.data) {
        setAlerts(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load emergency alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await phcService.acknowledgeAlert(alertId, "Dr. Rapid Response Team");
      toast.success("Alert Acknowledged. Response team notified.");
      await loadAlerts();
    } catch (e: any) {
      toast.error(e.message || "Acknowledge failed");
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      setResolving(true);
      await phcService.resolveAlert(selectedAlert._id, resolutionNotes, "District Epidemiologist");
      toast.success("Alert successfully marked as Resolved.");
      setResolveModalOpen(false);
      setResolutionNotes("");
      await loadAlerts();
    } catch (e: any) {
      toast.error(e.message || "Resolve failed");
    } finally {
      setResolving(false);
    }
  };

  const filteredAlerts = alerts.filter((al) => {
    if (filterSeverity === "ALL") return true;
    return al.severity.toUpperCase() === filterSeverity;
  });

  const criticalCount = alerts.filter((a) => a.severity === "Critical" && a.status !== "Resolved").length;
  const outbreakCount = alerts.filter((a) => a.alertType === "OUTBREAK_SURGE" && a.status !== "Resolved").length;
  const coldChainCount = alerts.filter((a) => a.alertType === "COLD_CHAIN_BREACH" && a.status !== "Resolved").length;
  const stockoutCount = alerts.filter((a) => a.alertType === "STOCKOUT_RISK" && a.status !== "Resolved").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* ── HEADER STRIP (ANTIGRAVITY EMERGENCY GLASS) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="mermaid-chip text-[11px] font-bold text-rose-500 border-rose-500/30">
                <Siren className="h-3.5 w-3.5 animate-pulse text-rose-500" />
                {t("phc.emergencyTriageHub", "High-Risk Triage Hub")}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                • {alerts.length} Total Incidents Monitored
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {t("phc.emergencyTitle", "Public Healthcare Emergency Intelligence")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t("phc.emergencySubtitle", "Rapid incident management for epidemic clusters, critical stockouts, cold-chain breaches, and capacity overloads")}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={loading}
            className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-2xl text-xs h-10 px-4 font-bold shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("phc.refreshIncidents", "Refresh Incidents")}
          </Button>
        </div>

        {/* ── TOP INCIDENT BENTO TILES (MERMAID GLASS) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="mermaid-glass p-5 rounded-3xl border border-rose-500/30 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.criticalIncidents", "Critical Incidents")}</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-3xl font-black font-mono text-rose-500 mt-2">{criticalCount}</p>
            <p className="text-[11px] text-rose-400 font-bold pt-1 font-mono">
              {t("phc.immediateIntervention", "Immediate intervention required")}
            </p>
          </div>

          <div className="mermaid-glass p-5 rounded-3xl border border-purple-500/30 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.potentialOutbreaks", "Potential Outbreaks")}</span>
              <Flame className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black font-mono text-purple-400 mt-2">{outbreakCount}</p>
            <p className="text-[11px] text-purple-400 font-bold pt-1 font-mono">
              {t("phc.symptomSpikes", "Epidemiological symptom spikes")}
            </p>
          </div>

          <div className="mermaid-glass p-5 rounded-3xl border border-cyan-500/30 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.coldChainBreaches", "Cold Chain Breaches")}</span>
              <Snowflake className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black font-mono text-cyan-400 mt-2">{coldChainCount}</p>
            <p className="text-[11px] text-cyan-400 font-bold pt-1 font-mono">
              {t("phc.vaccineTempRisks", "Vaccine temperature risks")}
            </p>
          </div>

          <div className="mermaid-glass p-5 rounded-3xl border border-amber-500/30 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase">
              <span>{t("phc.imminentStockouts", "Imminent Stockouts")}</span>
              <Pill className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black font-mono text-amber-500 mt-2">{stockoutCount}</p>
            <p className="text-[11px] text-amber-500 font-bold pt-1 font-mono">
              {t("phc.depletionWindow3d", "Depletion window < 3 days")}
            </p>
          </div>
        </div>

        {/* ── INCIDENTS FILTER & WORKFLOW LIST (MERMAID GLASS) ── */}
        <div className="mermaid-glass p-6 sm:p-7 rounded-[2rem] border border-rose-500/20 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-500/15 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                {t("phc.activeIncidentsWorkflow", "Active Emergency Incidents & Response Workflow")}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {t("phc.incidentLifecycle", "Lifecycle: Detected → Acknowledged → Action Taken → Resolved")}
              </p>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1 bg-card/80 p-1 rounded-2xl border border-teal-500/20">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-xl transition text-[10px] font-extrabold ${
                    filterSeverity === sev
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                No active incidents matching the selected severity level.
              </div>
            ) : (
              filteredAlerts.map((al) => (
                <div
                  key={al._id}
                  className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-teal-500/15 hover:border-rose-500/40 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        {al.alertType === "OUTBREAK_SURGE" && <Flame className="h-4 w-4" />}
                        {al.alertType === "COLD_CHAIN_BREACH" && <Snowflake className="h-4 w-4" />}
                        {al.alertType === "STOCKOUT_RISK" && <Pill className="h-4 w-4" />}
                        {al.alertType === "CAPACITY_OVERLOAD" && <Users className="h-4 w-4" />}
                        {al.alertType === "EQUIPMENT_FAILURE" && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground">{al.title}</h4>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {t("phc.facility", "Facility")}: <strong className="text-foreground">{al.phcId?.name || "PHC"}</strong> ({al.phcId?.district}) • {t("phc.trigger", "Trigger")}: {al.triggerSource}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          al.severity === "Critical"
                            ? "border-rose-500/40 text-rose-500 bg-rose-500/15 text-[10px] font-bold"
                            : "border-amber-500/40 text-amber-500 bg-amber-500/15 text-[10px] font-bold"
                        }
                      >
                        {al.severity}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={
                          al.status === "Resolved"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/15 text-[10px] font-bold"
                            : al.status === "Acknowledged"
                            ? "border-blue-500/40 text-blue-400 bg-blue-500/15 text-[10px] font-bold"
                            : "border-slate-500/40 text-muted-foreground text-[10px] font-bold"
                        }
                      >
                        {al.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 pl-12 leading-relaxed">{al.description}</p>

                  {al.recommendedAction && (
                    <div className="ml-12 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-600 dark:text-teal-300 font-mono">
                      ↳ {t("phc.proactiveAction", "AI Recommended Action")}: {al.recommendedAction}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-500/10 ml-12 text-[11px]">
                    <span className="text-muted-foreground font-mono">
                      {t("phc.confidence", "AI Confidence")}: <strong className="text-foreground">{al.aiConfidence}%</strong> • {t("phc.detected", "Detected")}: {new Date(al.createdAt).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {al.status === "Detected" && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(al._id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-sm"
                        >
                          {t("phc.acknowledgeIncident", "Acknowledge Incident")}
                        </Button>
                      )}
                      {al.status !== "Resolved" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(al);
                            setResolveModalOpen(true);
                          }}
                          className="mermaid-btn text-xs font-bold h-8 px-3 rounded-xl shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t("phc.markAsResolved", "Mark as Resolved")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── INCIDENT RESOLUTION MODAL (ANTIGRAVITY GLASS) ── */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md mermaid-glass border border-teal-500/30 text-foreground shadow-2xl rounded-3xl p-6">
          <DialogHeader className="border-b border-teal-500/15 pb-3">
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              {t("phc.resolveAlertModalTitle", "Resolve Emergency Alert & Record Intervention")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("phc.resolutionNotes", "Clinical Resolution & Field Action Notes")}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-3 py-2 text-xs">
              <p className="font-bold text-foreground text-sm">{selectedAlert.title}</p>
              <Textarea
                placeholder={t("phc.resolutionPlaceholder", "Detail the clinical interventions executed (e.g., Buffer stock dispatched, isolation wards mobilized, backup generator started)...")}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="antigravity-input bg-card/80 border border-teal-500/25 text-xs text-foreground rounded-2xl h-24 p-3"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-teal-500/15">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolveModalOpen(false)}
                  className="rounded-xl border-teal-500/30 text-muted-foreground text-xs"
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  size="sm"
                  disabled={resolving}
                  onClick={handleResolve}
                  className="mermaid-btn rounded-xl font-bold uppercase tracking-wider text-xs px-4"
                >
                  {resolving ? t("common.resolving", "Resolving...") : t("phc.markResolvedNotify", "Mark Resolved & Notify Network")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
