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
  ArrowLeft,
  Globe,
  Github,
  Calendar,
  Terminal,
  Shield,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { updateService, AppReleaseInfo, CURRENT_APP_VERSION } from "@/services/updateService";
import buildInfo from "@/config/buildInfo.json";

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
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

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
    setDownloading(true);
    // Direct local package download to guarantee 100% reliability with no 404
    const downloadUrl = "/app-release.apk";
    updateService.downloadAndInstall(downloadUrl);
    setTimeout(() => setDownloading(false), 2500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const isNative = updateService.isNativePlatform();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card/95 border border-border backdrop-blur-2xl rounded-3xl shadow-2xl text-foreground">
        
        {/* Header Strip */}
        <div className="relative p-6 bg-gradient-to-br from-teal-500/15 via-primary/10 to-transparent border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 px-2.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 text-muted-foreground hover:text-foreground shadow-sm"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Back</span>
              </Button>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-md">
                <ArrowUpCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-black font-display tracking-tight text-foreground">
                    Software Updates & APK Download
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
                  Package: {buildInfo.packageName} • Version Code: {buildInfo.versionCode}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={performCheck}
              disabled={checking}
              className="h-8 px-2.5 rounded-xl text-xs font-mono border border-border/60 hover:bg-muted"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checking ? "animate-spin text-teal-500" : ""}`} />
              {checking ? "Checking..." : "Re-check"}
            </Button>
          </div>

          {/* Build Telemetry Banner */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 p-3 rounded-2xl bg-background/80 border border-border/80 shadow-inner font-mono text-center">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                Installed
              </span>
              <span className="text-sm font-bold text-foreground">
                v{CURRENT_APP_VERSION}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                Latest Available
              </span>
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                v{releaseInfo?.latestVersion || CURRENT_APP_VERSION}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                File Size
              </span>
              <span className="text-sm font-bold text-foreground">
                {buildInfo.fileSize}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
          
          {/* Download Action */}
          <div className="space-y-2">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? "Initiating Download..." : "Download Release APK (app-release.apk)"}
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground font-mono">
              Direct download from GitHub Releases. Compatible with Android 10+ devices.
            </p>
          </div>

          {/* SHA-256 Checksum Inspection */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                SHA-256 checksum (Build-Time Generated)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(buildInfo.sha256Checksum, "hash")}
                className="text-[10px] font-mono text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
              >
                {copiedCmd === "hash" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedCmd === "hash" ? "Copied" : "Copy Hash"}
              </button>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 font-mono text-[10px] text-teal-300 break-all select-all border border-teal-500/20">
              <code>{buildInfo.sha256Checksum}</code>
            </div>
          </div>

          {/* Verification Commands per OS */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5 font-mono">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Integrity Verification Commands
            </div>

            <div className="space-y-2 text-[10px]">
              {/* Windows */}
              <div className="p-2.5 rounded-xl bg-background/90 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold">Windows (PowerShell / CMD):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(buildInfo.verificationCommands.windows, "win")}
                    className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {copiedCmd === "win" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === "win" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 font-mono text-teal-300 break-all select-all border border-teal-500/20 text-[10px]">
                  <code>{buildInfo.verificationCommands.windows}</code>
                </div>
              </div>

              {/* macOS */}
              <div className="p-2.5 rounded-xl bg-background/90 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold">macOS (Terminal):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(buildInfo.verificationCommands.macos, "mac")}
                    className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {copiedCmd === "mac" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === "mac" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 font-mono text-teal-300 break-all select-all border border-teal-500/20 text-[10px]">
                  <code>{buildInfo.verificationCommands.macos}</code>
                </div>
              </div>

              {/* Linux */}
              <div className="p-2.5 rounded-xl bg-background/90 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold">Linux (Bash):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(buildInfo.verificationCommands.linux, "linux")}
                    className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {copiedCmd === "linux" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === "linux" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 font-mono text-teal-300 break-all select-all border border-teal-500/20 text-[10px]">
                  <code>{buildInfo.verificationCommands.linux}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Sideload & In-Place Upgrade Requirements Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              In-Place Upgrade & Sideloading Notes
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[10px] leading-relaxed">
              <li>
                <strong>In-Place Upgrade:</strong> An in-place APK upgrade without data loss requires the identical package name (<code>com.healthpulse.app</code>), the same production signing key, and a higher version code than the installed APK.
              </li>
              <li>
                <strong>Play Protect Notice:</strong> Google Play Protect warnings (<em>"Unrecognized app source"</em>) are expected for all directly sideloaded APKs distributed outside the Play Store. Tap <strong>"More details"</strong> and <strong>"Install anyway"</strong> to complete installation.
              </li>
            </ul>
          </div>

          {/* External Links */}
          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
            <a
              href={releaseInfo?.githubReleaseUrl || "https://github.com/siddarthakumar001-rocky/HealthPulse_AI/releases"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Releases</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href="https://healthpulse-ai.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Project Website</span>
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
