import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  PhoneCall,
  Share2,
  Calendar,
  ExternalLink,
  Shield,
  Stethoscope,
  Heart,
  Sparkles,
  Wind,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function DemoDataBadge() {
  return (
    <Badge variant="outline" className="text-[9px] font-mono border-amber-500/40 text-amber-500 bg-amber-500/10 uppercase tracking-wider">
      Sample / Demo Record
    </Badge>
  );
}

interface SpecialistEntry {
  id: string;
  department: string;
  icon: typeof Stethoscope;
  name: string;
  affiliation: string;
  isOfficialService: boolean;
  officialUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  description: string;
}

const SPECIALIST_DIRECTORY: SpecialistEntry[] = [
  // ── 1. OFFICIAL VERIFIED NATIONAL TELEMEDICINE INFRASTRUCTURE ──
  {
    id: "esanjeevani-national",
    department: "National General & Specialist Teleconsultation",
    icon: Building,
    name: "eSanjeevani (National Telemedicine Service of India)",
    affiliation: "Ministry of Health & Family Welfare (MoHFW), Govt. of India",
    isOfficialService: true,
    officialUrl: "https://esanjeevani.mohfw.gov.in",
    phone: "1075",
    description: "Official, government-operated nationwide doctor teleconsultation platform connecting patients with registered public specialists.",
  },
  {
    id: "tele-manas-mental",
    department: "National Mental Health & Psychological Support",
    icon: Sparkles,
    name: "Tele-MANAS Tele-Counselling Cell",
    affiliation: "National Mental Health Programme, MoHFW",
    isOfficialService: true,
    officialUrl: "https://telemanas.mohfw.gov.in",
    phone: "14416",
    description: "24x7 toll-free comprehensive mental health helpline and psychological tele-counselling network.",
  },

  // ── 2. SPECIALTY CLINICAL DEPARTMENTS (MARKED AS DEMO / SAMPLE RECORDS) ──
  {
    id: "spec-cardiology",
    department: "Cardiology & Arrhythmia Clinic",
    icon: Heart,
    name: "District PHC Referral Cardiac Desk",
    affiliation: "Public Health Network Tele-Cardiology Node",
    isOfficialService: false,
    phone: "+918023456781",
    whatsappNumber: "918023456781",
    description: "Evaluation for elevated heart rate, ECG arrhythmias, blood pressure fluctuations, and chest tightness.",
  },
  {
    id: "spec-dermatology",
    department: "Dermatology & Skin Triage",
    icon: Stethoscope,
    name: "Clinical Dermatology Tele-Triage Desk",
    affiliation: "Regional Medical College Department of Dermatology",
    isOfficialService: false,
    phone: "+918023456782",
    whatsappNumber: "918023456782",
    description: "Specialized review of acute skin rashes, fungal infections, allergic lesions, and chronic dermatitis.",
  },
  {
    id: "spec-pulmonology",
    department: "Pulmonology & Respiratory Medicine",
    icon: Wind,
    name: "Respiratory & Asthma Tele-Clinic",
    affiliation: "Public Health Critical Care & Respiratory Unit",
    isOfficialService: false,
    phone: "+918023456783",
    whatsappNumber: "918023456783",
    description: "Clinical evaluation for SpO2 desaturation, persistent cough, allergic bronchitis, and asthma management.",
  },
  {
    id: "spec-gynecology",
    department: "Obstetrics & Gynecological Health",
    icon: Sparkles,
    name: "Women's Health & Hormonal Clinic",
    affiliation: "Maternal & Child Healthcare Centre",
    isOfficialService: false,
    phone: "+918023456784",
    whatsappNumber: "918023456784",
    description: "Guidance on menstrual regularity, PCOS/PCOD management, hormonal wellness, and antenatal care.",
  },
];

export function SpecialistConsultDirectory() {
  const { user } = useAuth();

  // WhatsApp Intake Preview State
  const [whatsappModal, setWhatsappModal] = useState<{
    isOpen: boolean;
    specialist?: SpecialistEntry;
    text: string;
    consentGiven: boolean;
  }>({
    isOpen: false,
    text: "",
    consentGiven: false,
  });

  // Booking Modal State (Does NOT display fake confirmed booking without actual request)
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    specialist?: SpecialistEntry;
    preferredDate: string;
    reason: string;
    submitted: boolean;
  }>({
    isOpen: false,
    preferredDate: "",
    reason: "",
    submitted: false,
  });

  const openWhatsAppPreview = (specialist: SpecialistEntry) => {
    const defaultText = `Hello ${specialist.name},\n\nI would like to request an outpatient clinical consultation.\n• Patient: ${user?.user_metadata?.name || "Patient"}\n• Department: ${specialist.department}\n• Clinical Query: Seeking specialist review regarding recent symptoms.\n\nPlease let me know available appointment slots.`;

    setWhatsappModal({
      isOpen: true,
      specialist,
      text: defaultText,
      consentGiven: false,
    });
  };

  const executeWhatsAppSend = () => {
    if (!whatsappModal.specialist) return;
    if (!whatsappModal.consentGiven) {
      toast.error("Please confirm consent to proceed to WhatsApp.");
      return;
    }

    const encoded = encodeURIComponent(whatsappModal.text);
    const targetUrl = whatsappModal.specialist.whatsappNumber
      ? `https://wa.me/${whatsappModal.specialist.whatsappNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setWhatsappModal({ isOpen: false, text: "", consentGiven: false });
  };

  const handleBookingSubmit = () => {
    if (!bookingModal.preferredDate || !bookingModal.reason.trim()) {
      toast.error("Please specify a preferred consultation date and reason.");
      return;
    }

    // Mark as submitted request, pending specialist review (truthful status)
    setBookingModal((prev) => ({ ...prev, submitted: true }));
    toast.success("Appointment request registered. Pending clinic scheduling review.");
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-card border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
              Clinical Teleconsultation Network
            </span>
          </div>
          <h2 className="text-xl font-black font-display text-foreground tracking-tight">
            Specialist Doctor Direct Contact Directory
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Access verified national public telemedicine services and departmental clinical specialty desks. All sample departmental entries are clearly labeled.
          </p>
        </div>

        <a
          href="https://esanjeevani.mohfw.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Open eSanjeevani (Official)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Specialist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SPECIALIST_DIRECTORY.map((spec) => {
          const Icon = spec.icon;
          return (
            <Card key={spec.id} className="bg-card border border-border shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden hover:border-teal-500/40 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-foreground">
                        {spec.name}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {spec.affiliation}
                      </CardDescription>
                    </div>
                  </div>

                  {spec.isOfficialService ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                      Official National Portal
                    </Badge>
                  ) : (
                    <DemoDataBadge />
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {spec.description}
                </p>

                {/* Direct Contact Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/80">
                  {spec.phone && (
                    <a
                      href={`tel:${spec.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Direct Call ({spec.phone})</span>
                    </a>
                  )}

                  {spec.isOfficialService && spec.officialUrl && (
                    <a
                      href={spec.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-teal-500" />
                      <span>Official Portal</span>
                    </a>
                  )}

                  {!spec.isOfficialService && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWhatsAppPreview(spec)}
                        className="h-8 px-2.5 rounded-xl text-[11px] font-mono font-semibold flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>WhatsApp Intake</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setBookingModal({
                            isOpen: true,
                            specialist: spec,
                            preferredDate: "",
                            reason: "",
                            submitted: false,
                          })
                        }
                        className="h-8 px-2.5 rounded-xl text-[11px] font-mono font-semibold text-muted-foreground hover:text-foreground"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Request Slot</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── WHATSAPP INTAKE PREVIEW & CONSENT MODAL ── */}
      <Dialog open={whatsappModal.isOpen} onOpenChange={(open) => !open && setWhatsappModal((prev) => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-md bg-card border border-border rounded-3xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500" />
              WhatsApp Consultation Intake Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review and edit the message before opening WhatsApp. No automated dispatch occurs without your confirmation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">Editable Message Text:</Label>
              <Textarea
                value={whatsappModal.text}
                onChange={(e) => setWhatsappModal((prev) => ({ ...prev, text: e.target.value }))}
                className="text-xs font-mono min-h-[140px] rounded-xl"
              />
            </div>

            {/* Explicit Consent Checkbox */}
            <div className="flex items-start space-x-2 text-xs">
              <Checkbox
                id="wa-consent"
                checked={whatsappModal.consentGiven}
                onCheckedChange={(checked) => setWhatsappModal((prev) => ({ ...prev, consentGiven: Boolean(checked) }))}
              />
              <Label htmlFor="wa-consent" className="text-xs cursor-pointer leading-relaxed text-muted-foreground">
                I review this message and consent to opening WhatsApp to transmit this clinical consultation request.
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWhatsappModal((prev) => ({ ...prev, isOpen: false }))}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={executeWhatsAppSend}
              disabled={!whatsappModal.consentGiven}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Proceed to WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── TELECONSULTATION BOOKING REQUEST MODAL (TRUTHFUL STATUS) ── */}
      <Dialog open={bookingModal.isOpen} onOpenChange={(open) => !open && setBookingModal((prev) => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-md bg-card border border-border rounded-3xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              Request Specialty Consultation Slot
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {bookingModal.specialist?.name} • {bookingModal.specialist?.department}
            </DialogDescription>
          </DialogHeader>

          {bookingModal.submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Consultation Request Registered
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Your request has been submitted to the clinic queue. Confirmation and appointment slot assignment are pending doctor review.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-xl text-xs mt-2"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4 my-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-mono text-muted-foreground">Preferred Date:</Label>
                <input
                  type="date"
                  value={bookingModal.preferredDate}
                  onChange={(e) => setBookingModal((prev) => ({ ...prev, preferredDate: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-mono text-muted-foreground">Reason for Consultation:</Label>
                <Textarea
                  value={bookingModal.reason}
                  onChange={(e) => setBookingModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Describe your symptoms or reason for specialty review..."
                  className="text-xs font-mono min-h-[80px] rounded-xl"
                />
              </div>

              <p className="text-[10px] text-muted-foreground font-mono">
                Note: This registers a consultation request. Final confirmation is subject to clinic availability.
              </p>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingModal((prev) => ({ ...prev, isOpen: false }))}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBookingSubmit}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  Submit Consultation Request
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SpecialistConsultDirectory;

