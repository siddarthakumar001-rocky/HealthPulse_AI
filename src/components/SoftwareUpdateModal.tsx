import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ArrowUpCircle,
  Globe,
  Github,
  Calendar,
} from "lucide-react";
import { updateService, AppReleaseInfo, CURRENT_APP_VERSION } from "@/services/updateService";
import { motion, AnimatePresence } from "framer-motion";

interface SoftwareUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCheckOnOpen?: boolean;
}

export function SoftwareUpdateModal({
  isOpen,
  onClose,
  autoCheckOnOpen = true,
}: SoftwareUpdateModalProps) {
  const [checking, setChecking] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<AppReleaseInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  const performCheck = async () => {
    try {
      setChecking(true);
      const info = await updateService.checkForUpdates();
      setReleaseInfo(info);
    } catch (err) {
      console.error("Failed to check for updates:", err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen && autoCheckOnOpen && !releaseInfo) {
      performCheck();
    }
  }, [isOpen, autoCheckOnOpen]);

  const handleDownload = () => {
    if (!releaseInfo) return;
    setDownloading(true);
    updateService.downloadAndInstall(releaseInfo.apkDownloadUrl || releaseInfo.githubReleaseUrl);
    setTimeout(() => setDownloading(false), 3000);
  };

  const isNative = updateService.isNativePlatform();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card/95 border border-border backdrop-blur-2xl rounded-3xl shadow-2xl text-foreground">
        {/* Glowing Top Banner */}
        <div className="relative p-6 bg-gradient-to-br from-teal-500/15 via-primary/10 to-transparent border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-md">
                <ArrowUpCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-black font-display tracking-tight text-foreground">
                    Software Updates
                  </DialogTitle>
                  {releaseInfo?.hasUpdate ? (
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      Update Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                      v{CURRENT_APP_VERSION}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {isNative ? "Android Native Mobile Build" : "Web & Cross-Platform Telemetry Client"}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={performCheck}
              disabled={checking}
              className="h-8 px-2.5 rounded-xl text-xs font-mono border border-border/60 hover:bg-muted"
              title="Check latest releases"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checking ? "animate-spin text-teal-500" : ""}`} />
              {checking ? "Checking..." : "Re-check"}
            </Button>
          </div>

          {/* Version Comparison Card */}
          <div className="grid grid-cols-2 gap-3 mt-5 p-3.5 rounded-2xl bg-background/80 border border-border/80 shadow-inner">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Installed Version
              </span>
              <span className="text-base font-black font-mono text-foreground">
                v{CURRENT_APP_VERSION}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Latest Available
              </span>
              <span className="text-base font-black font-mono text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                v{releaseInfo?.latestVersion || CURRENT_APP_VERSION}
                {releaseInfo?.hasUpdate && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {checking ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-xs text-muted-foreground font-mono">
                Querying GitHub Releases & Telemetry Update Mirrors...
              </p>
            </div>
          ) : releaseInfo?.hasUpdate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-bold text-foreground truncate max-w-[260px]">
                  {releaseInfo.releaseName}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  {new Date(releaseInfo.publishedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Release Notes */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  What's New in this Release:
                </p>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                  {releaseInfo.releaseNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download / Auto-Update Direct Action */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
                  {downloading ? "Initiating Download..." : "Download & Install New Version (APK)"}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground font-mono">
                  {isNative
                    ? "APK will download to your device. Tap the notification to complete in-place installation."
                    : "Direct download from GitHub Releases. Compatible with all Android devices."}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                You're on the Latest Version
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                HealthPulse AI v{CURRENT_APP_VERSION} is currently running with all recent performance, security, and medical telemetry modules fully synchronized.
              </p>
            </div>
          )}

          {/* External Links Strip */}
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
            <a
              href={releaseInfo?.githubReleaseUrl || "https://github.com/siddhant-deshmukh/healthpulse-ai/releases"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Releases</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={releaseInfo?.websiteUrl || "https://healthpulse-ai.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Product Website</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SoftwareUpdateModal;
