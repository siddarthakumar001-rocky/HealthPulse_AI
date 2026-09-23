import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { phcService, PHCAlertItem } from "@/services/phcService";
import { toast } from "sonner";
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
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 tracking-wide uppercase flex items-center gap-1">
                <Siren className="h-3 w-3 animate-pulse text-rose-400" /> Emergency Incident Response
              </span>
              <span className="text-xs text-slate-400">• High-Risk Triage Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-200 to-cyan-300 mt-1">
              Public Healthcare Emergency Intelligence
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Rapid incident management for epidemic clusters, critical stockouts, cold-chain breaches, and capacity overloads
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={loading}
            className="border-rose-500/40 text-rose-300 hover:bg-rose-950/40 bg-slate-900/60 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Incidents
          </Button>
        </div>

        {/* Top Incident Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-rose-950/30 border-rose-500/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Critical Incidents</span>
                <AlertOctagon className="h-5 w-5 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-300 mt-1">{criticalCount}</p>
              <p className="text-[11px] text-rose-400/80 mt-0.5">Immediate intervention required</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/30 border-purple-500/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Potential Outbreaks</span>
                <Flame className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-300 mt-1">{outbreakCount}</p>
              <p className="text-[11px] text-purple-400/80 mt-0.5">Epidemiological symptom spikes</p>
            </CardContent>
          </Card>

          <Card className="bg-cyan-950/30 border-cyan-500/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Cold Chain Breaches</span>
                <Snowflake className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-cyan-300 mt-1">{coldChainCount}</p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Vaccine temperature risks</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/30 border-amber-500/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Imminent Stockouts</span>
                <Pill className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-300 mt-1">{stockoutCount}</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">Depletion window &lt; 3 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Incidents Filter & List */}
        <Card className="bg-slate-900/80 border-rose-500/30 shadow-xl">
          <CardHeader className="p-4 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Active Emergency Incidents & Response Workflow
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Lifecycle: Detected → Acknowledged → Action Taken → Resolved
              </CardDescription>
            </div>

            <div className="flex items-center gap-1 text-xs">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded transition text-[11px] font-medium ${
                    filterSeverity === sev
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                No active incidents matching the selected severity level.
              </div>
            ) : (
              filteredAlerts.map((al) => (
                <div
                  key={al._id}
                  className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded bg-rose-500/10 text-rose-400">
                        {al.alertType === "OUTBREAK_SURGE" && <Flame className="h-4 w-4" />}
                        {al.alertType === "COLD_CHAIN_BREACH" && <Snowflake className="h-4 w-4" />}
                        {al.alertType === "STOCKOUT_RISK" && <Pill className="h-4 w-4" />}
                        {al.alertType === "CAPACITY_OVERLOAD" && <Users className="h-4 w-4" />}
                        {al.alertType === "EQUIPMENT_FAILURE" && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{al.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          Facility: <strong className="text-cyan-300">{al.phcId?.name || "PHC"}</strong> ({al.phcId?.district}) • Trigger: {al.triggerSource}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          al.severity === "Critical"
                            ? "border-rose-500 text-rose-400 bg-rose-950/30 text-xs"
                            : "border-amber-500 text-amber-400 bg-amber-950/30 text-xs"
                        }
                      >
                        {al.severity}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={
                          al.status === "Resolved"
                            ? "border-emerald-500 text-emerald-400 bg-emerald-950/30 text-xs"
                            : al.status === "Acknowledged"
                            ? "border-blue-500 text-blue-400 bg-blue-950/30 text-xs"
                            : "border-slate-700 text-slate-400 text-xs"
                        }
                      >
                        {al.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 pl-10">{al.description}</p>

                  {al.recommendedAction && (
                    <div className="ml-10 p-2.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
                      ↳ AI Recommended Action: {al.recommendedAction}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 ml-10 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      AI Confidence: <strong className="text-cyan-400">{al.aiConfidence}%</strong> • Detected: {new Date(al.createdAt).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {al.status === "Detected" && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(al._id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-7"
                        >
                          Acknowledge Incident
                        </Button>
                      )}
                      {al.status !== "Resolved" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(al);
                            setResolveModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Incident Resolution Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md bg-[rgb(8,14,28)] border border-rose-500/30 text-white shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Resolve Emergency Incident
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Document resolution action and closing notes
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-3 py-2 text-xs">
              <p className="font-semibold text-slate-200">{selectedAlert.title}</p>
              <Textarea
                placeholder="Enter actions taken (e.g. Stocks transferred from CHC Khandala, emergency buffer activated)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white h-24"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolveModalOpen(false)}
                  className="text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={resolving}
                  onClick={handleResolve}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {resolving ? "Resolving..." : "Confirm Resolution"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
