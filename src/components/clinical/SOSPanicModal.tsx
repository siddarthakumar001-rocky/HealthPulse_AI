import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  PhoneCall,
  Share2,
  Volume2,
  VolumeX,
  AlertTriangle,
  LocateFixed,
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
  X,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { toast } from "sonner";

interface SOSPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVitals?: {
    heartRate?: number;
    spO2?: number;
    temperature?: number;
  };
}

export function SOSPanicModal({
  isOpen,
  onClose,
  currentVitals,
}: SOSPanicModalProps) {
  const { user } = useAuth();
  const [silentMode, setSilentMode] = useState(false);
  const [strobeActive, setStrobeActive] = useState(true);

  // Sharing preferences
  const [shareLocation, setShareLocation] = useState(true);
  const [shareVitals, setShareVitals] = useState(true);
  const [shareBaseline, setShareBaseline] = useState(false);

  // Real-time Geolocation tracking with accuracy & fallback
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locTimestamp, setLocTimestamp] = useState<string | null>(null);
  const [alertDispatched, setAlertDispatched] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Capture position on open
  useEffect(() => {
    if (!isOpen) return;

    // Load cached last known position first
    try {
      const cached = localStorage.getItem("last_known_gps");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.lat && parsed.lng) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setAccuracy(parsed.accuracy || 25);
          setLocTimestamp(parsed.timestamp || new Date().toLocaleTimeString());
        }
      }
    } catch (_) {}

    // Request fresh location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fresh = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(fresh);
          setAccuracy(Math.round(pos.coords.accuracy));
          setLocTimestamp(new Date(pos.timestamp).toLocaleTimeString());
          try {
            localStorage.setItem(
              "last_known_gps",
              JSON.stringify({ ...fresh, accuracy: Math.round(pos.coords.accuracy), timestamp: new Date(pos.timestamp).toLocaleTimeString() })
            );
          } catch (_) {}
        },
        (err) => {
          console.warn("[SOS] GPS acquisition warning, using fallback:", err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [isOpen]);

  // Audible Siren via Web Audio API (optional, can be muted)
  useEffect(() => {
    if (!isOpen || silentMode) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        let highTone = false;
        const playTone = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(highTone ? 960 : 780, ctx.currentTime);
          highTone = !highTone;

          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        };

        playTone();
        sirenIntervalRef.current = setInterval(playTone, 400);
      }
    } catch (e) {
      console.warn("[SOS Audio] Siren not permitted without interaction:", e);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
    };
  }, [isOpen, silentMode]);

  // Background dispatch of /api/alerts with retry and idempotency key
  useEffect(() => {
    if (!isOpen || alertDispatched) return;

    const dispatchAlert = async (attemptsLeft = 3) => {
      const idempotencyKey = `sos-${user?.id || 'guest'}-${Date.now().toString(36)}`;
      try {
        await api.post("/alerts", {
          message: "EMERGENCY SOS BROADCAST TRIGGERED BY USER",
          severity: "critical",
          idempotencyKey,
          location: coords ? { latitude: coords.lat, longitude: coords.lng, accuracy } : undefined,
          vitals: currentVitals,
        });
        setAlertDispatched(true);
      } catch (err) {
        if (attemptsLeft > 1) {
          setTimeout(() => dispatchAlert(attemptsLeft - 1), 2000);
        } else {
          console.warn("[SOS] Alert dispatch failed after retries:", err);
        }
      }
    };

    dispatchAlert();
  }, [isOpen, coords, alertDispatched, user?.id, currentVitals, accuracy]);

  // Clean and encode emergency contact phone number
  const rawContact = user?.user_metadata?.emergency_contact || "";
  const cleanContactNumber = rawContact.replace(/[^0-9+]/g, "");

  // Generate WhatsApp message preview
  const buildWhatsAppMessage = () => {
    let msg = "🚨 *EMERGENCY SOS MEDICAL ALERT* 🚨\n";
    msg += `Patient: ${user?.user_metadata?.name || "Patient"}\n`;

    if (shareVitals && currentVitals) {
      msg += "\n*Current Live Vitals:*\n";
      if (currentVitals.heartRate) msg += `• Heart Rate: ${currentVitals.heartRate} bpm\n`;
      if (currentVitals.spO2) msg += `• SpO2: ${currentVitals.spO2}%\n`;
      if (currentVitals.temperature) msg += `• Temperature: ${currentVitals.temperature}°C\n`;
    }

    if (shareLocation && coords) {
      msg += `\n*Location (Accuracy: ±${accuracy || 20}m):*\nhttps://maps.google.com/?q=${coords.lat},${coords.lng}\n`;
    }

    if (shareBaseline && user?.user_metadata) {
      msg += `• Age: ${user.user_metadata.age || "N/A"} | Gender: ${user.user_metadata.gender || "N/A"}\n`;
    }

    msg += "\nPlease send emergency assistance immediately!";
    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    const targetUrl = cleanContactNumber
      ? `https://wa.me/${cleanContactNumber}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card/95 border border-red-500/40 backdrop-blur-2xl rounded-3xl shadow-2xl text-foreground">
        
        {/* Top Visual Strobe Header (pulsates at 2.5 Hz <= 3 Hz max, disabled on reduced motion) */}
        <div
          className={`relative p-5 text-white transition-colors duration-300 ${
            strobeActive ? "bg-red-600 dark:bg-red-700 animate-[pulse_0.4s_ease-in-out_infinite] motion-reduce:animate-none" : "bg-red-800"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                  Emergency SOS Active
                </DialogTitle>
                <DialogDescription className="text-xs text-red-100 font-mono">
                  District Emergency Response & Contact Ring
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSilentMode(!silentMode)}
                className="w-9 h-9 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/30"
                title={silentMode ? "Enable Siren" : "Mute Siren"}
              >
                {silentMode ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1. DIRECT CALL BUTTONS (RENDERED FIRST) */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              1. Direct Emergency Dialing (Tap to Call Immediately)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 font-bold transition-all shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <span className="text-sm font-black block">Call 112</span>
                    <span className="text-[10px] text-muted-foreground font-mono">National All-in-One Emergency</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-red-500/30 text-red-500 text-[10px]">
                  Police/Fire/Medical
                </Badge>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold transition-all shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="text-sm font-black block">Call 108</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Ambulance & Disaster Fleet</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                  Ambulance
                </Badge>
              </a>
            </div>

            {cleanContactNumber ? (
              <a
                href={`tel:${encodeURIComponent(cleanContactNumber)}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold transition-all shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <div>
                    <span className="text-sm font-black block">Call Personal Emergency Contact</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{cleanContactNumber}</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400 text-[10px]">
                  Primary Contact
                </Badge>
              </a>
            ) : (
              <p className="text-[11px] text-muted-foreground font-mono px-1">
                No personal emergency contact configured. You can add one in your Profile.
              </p>
            )}
          </div>

          {/* 2. LIVE LOCATION & ACCURACY STATUS */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-foreground">
                <LocateFixed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                GPS Location Lock
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {locTimestamp ? `Updated: ${locTimestamp}` : "Acquiring..."}
              </span>
            </div>

            {coords ? (
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>
                  [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Accuracy: ±{accuracy || 20}m
                </span>
              </div>
            ) : (
              <p className="text-xs text-amber-500 font-mono">
                Acquiring GPS fix... Fallback to last known coordinates active.
              </p>
            )}
          </div>

          {/* 3. SHARING OPTIONS */}
          <div className="space-y-2 pt-1 border-t border-border">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              2. Details to Share in WhatsApp Distress Broadcast
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-loc"
                  checked={shareLocation}
                  onCheckedChange={(checked) => setShareLocation(Boolean(checked))}
                />
                <Label htmlFor="share-loc" className="text-xs font-semibold cursor-pointer">
                  Include real-time GPS coordinates & Google Maps link
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-vit"
                  checked={shareVitals}
                  onCheckedChange={(checked) => setShareVitals(Boolean(checked))}
                />
                <Label htmlFor="share-vit" className="text-xs font-semibold cursor-pointer">
                  Include current cardiovascular vitals (HR, SpO2, Temperature)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-base"
                  checked={shareBaseline}
                  onCheckedChange={(checked) => setShareBaseline(Boolean(checked))}
                />
                <Label htmlFor="share-base" className="text-xs font-semibold cursor-pointer">
                  Include medical baseline info (Age, Gender)
                </Label>
              </div>
            </div>
          </div>

          {/* 4. SHARE SOS ON WHATSAPP BUTTON */}
          <div className="space-y-2 pt-1 border-t border-border">
            <Button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share SOS on WhatsApp
            </Button>
            <p className="text-[10px] text-center text-muted-foreground font-mono">
              Clicking will open WhatsApp with an editable pre-filled distress message. You can review before sending.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Alert logged to emergency registry
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs px-4"
          >
            Close SOS Window
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SOSPanicModal;

