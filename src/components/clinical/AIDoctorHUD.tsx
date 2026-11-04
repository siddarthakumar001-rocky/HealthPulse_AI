import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Stethoscope,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  HelpCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { checkClinicalRedFlags, redactPersonalIdentifiers, sanitizeAIOuput, StructuredClinicalAdvice } from "@/lib/clinicalSafety";
import { sanitizeAndCompressImage, ProcessedImageResult } from "@/lib/imageSafety";
import SOSPanicModal from "./SOSPanicModal";

interface Message {
  id: string;
  sender: "user" | "doctor";
  text?: string;
  imagePreview?: string;
  structuredAdvice?: StructuredClinicalAdvice;
  timestamp: string;
}

export function AIDoctorHUD() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "doctor",
      text: "Hello, I am your HealthPulse AI Clinical Triage Assistant. You can describe your symptoms, ask questions about lab tests, dictate with your microphone, or upload an image (e.g., skin rash, eye redness, swelling). How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProcessedImageResult | null>(null);
  const [retainImagesConsent, setRetainImagesConsent] = useState(false);

  // Red-Flag Emergency State
  const [redFlagIntercept, setRedFlagIntercept] = useState<{
    triggered: boolean;
    reason?: string;
    matchedTrigger?: string;
  } | null>(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Privacy & Consent State
  const [aiConsentGiven, setAiConsentGiven] = useState(() => {
    return localStorage.getItem("consent_ai_doctor_processing") !== "false";
  });

  // Voice Input (SpeechRecognition) State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice Output (SpeechSynthesis) State - OFF by default
  const [spokenRepliesEnabled, setSpokenRepliesEnabled] = useState(false);

  // Map active language to speech recognition locale
  const getSpeechLocale = () => {
    const lang = i18n.language || "en";
    if (lang === "hi") return "hi-IN";
    if (lang === "kn") return "kn-IN";
    if (lang === "ta") return "ta-IN";
    if (lang === "te") return "te-IN";
    return "en-IN";
  };

  // Setup Web SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLocale();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [i18n.language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.info("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = getSpeechLocale();
        recognitionRef.current.start();
        setIsListening(true);
        toast.info(`Listening in ${getSpeechLocale()}... Speak your symptoms clearly.`);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // Speak AI text response using Web SpeechSynthesis (only if enabled or user clicks speaker)
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLocale();
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Sanitizing image & stripping EXIF metadata...");
      const processed = await sanitizeAndCompressImage(file);
      setSelectedImage(processed);
      toast.success("Image verified and prepared for clinical visual inspection.");
    } catch (err: any) {
      toast.error(err.message || "Failed to process image.");
    }
  };

  const handleSendMessage = async () => {
    const prompt = inputMessage.trim();
    if (!prompt && !selectedImage) return;

    // 1. Mandatory Privacy Consent Check
    if (!aiConsentGiven) {
      saveConsent(true);
    }

    // 2. Deterministic Red-Flag Safety Check (BEFORE any network/model call)
    const redFlagCheck = checkClinicalRedFlags(prompt);
    if (redFlagCheck.isRedFlag) {
      setRedFlagIntercept({
        triggered: true,
        reason: redFlagCheck.reason,
        matchedTrigger: redFlagCheck.matchedTrigger,
      });
      return;
    }

    // 3. User message representation
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: prompt,
      imagePreview: selectedImage?.previewUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    // Redact direct PII from text prompt before transmission
    const sanitizedPrompt = redactPersonalIdentifiers(prompt);

    try {
      if (selectedImage) {
        // Send to visual clinical triage endpoint
        const formData = new FormData();
        formData.append("image", selectedImage.file);
        formData.append("description", sanitizedPrompt || "Dermatological visual inspection");
        formData.append("retain_consult_images", retainImagesConsent ? "true" : "false");

        const res: any = await api.post("/skin-analyze", formData);

        const structured: StructuredClinicalAdvice = res?.data || {
          urgencyLevel: "ROUTINE_CONSULT",
          possibleCausesToDiscuss: ["Visual characteristics require physical dermatological inspection"],
          whatToWatchFor: ["Spreading redness", "Increasing pain or warmth", "Swelling"],
          followUpQuestionsForDoctor: ["Would a patch test or dermoscopy be advised?"],
          clinicalNotes: "Visual triage conducted. Please consult a dermatologist for definitive evaluation.",
          disclaimer: res?.disclaimer || "Not a definitive diagnosis.",
        };

        const doctorMsg: Message = {
          id: `doc-${Date.now()}`,
          sender: "doctor",
          structuredAdvice: structured,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, doctorMsg]);

        if (spokenRepliesEnabled && structured.clinicalNotes) {
          speakText(structured.clinicalNotes);
        }
        setSelectedImage(null);
      } else {
        // Direct text consultation via /api/doctor-ai
        const res: any = await api.post("/doctor-ai", { prompt: sanitizedPrompt });

        const structured: StructuredClinicalAdvice = res?.data || {
          urgencyLevel: "ROUTINE_CONSULT",
          possibleCausesToDiscuss: ["Clinical evaluation required for symptoms described"],
          whatToWatchFor: ["Difficulty breathing", "Sudden sharp chest pains", "High persistent fever"],
          followUpQuestionsForDoctor: ["What diagnostic blood tests should I perform?"],
          clinicalNotes: sanitizeAIOuput(res?.reply || "Consult a registered doctor."),
          disclaimer: res?.disclaimer || "Educational triage guidance.",
        };

        const doctorMsg: Message = {
          id: `doc-${Date.now()}`,
          sender: "doctor",
          structuredAdvice: structured,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, doctorMsg]);

        if (spokenRepliesEnabled && structured.clinicalNotes) {
          speakText(structured.clinicalNotes);
        }
      }
    } catch (err: any) {
      toast.error("Consultation request could not be completed. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "doctor",
          text: "I could not reach the clinical reasoning service at this moment. If you are experiencing concerning symptoms, please visit your nearest Primary Health Centre or dial 112 / 108.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveConsent = (checked: boolean) => {
    setAiConsentGiven(checked);
    localStorage.setItem("consent_ai_doctor_processing", checked ? "true" : "false");
  };

  return (
    <div className="space-y-6">
      
      {/* ── RED-FLAG EMERGENCY INTERCEPT SCREEN ── */}
      {redFlagIntercept?.triggered && (
        <Card className="border-2 border-red-600 bg-red-500/10 dark:bg-red-950/40 p-6 rounded-3xl shadow-2xl animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <AlertTriangle className="w-9 h-9" />
              </div>
              <div>
                <Badge variant="destructive" className="uppercase font-mono text-xs px-2.5 py-0.5 font-bold">
                  Acute Red-Flag Emergency Intercept
                </Badge>
                <h3 className="text-xl font-black text-red-700 dark:text-red-300 mt-1">
                  Immediate Emergency Medical Attention Required
                </h3>
                <p className="text-xs text-red-800 dark:text-red-200 mt-1 leading-relaxed max-w-2xl">
                  {redFlagIntercept.reason} Our safety protocol has intercepted this query to prevent dangerous delays.
                  <strong> Do not wait for AI advice or type further. Call emergency responders or go to the nearest emergency department immediately.</strong>
                </p>
                {redFlagIntercept.matchedTrigger && (
                  <p className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-1">
                    Matched Emergency Sign: "{redFlagIntercept.matchedTrigger}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="tel:112"
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                Call 112 (National Emergency)
              </a>
              <a
                href="tel:108"
                className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                Call 108 (Ambulance)
              </a>
              <Button
                variant="destructive"
                onClick={() => setSosModalOpen(true)}
                className="rounded-2xl h-11 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                Broadcast SOS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRedFlagIntercept(null)}
                className="h-11 rounded-2xl text-xs font-mono"
              >
                Dismiss Warning
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── INTERACTIVE CONSULTATION COCKPIT ── */}
      <Card className="bg-card border border-border shadow-xl rounded-3xl overflow-hidden">
        
        {/* Cockpit Header */}
        <CardHeader className="p-5 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-sm sm:text-base font-black font-display tracking-tight text-foreground">
                    AI Clinical Consultation HUD
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-teal-500/40 text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    Multimodal Triage
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground font-mono">
                  Deterministic Red-Flag Guard Active • Zero PII Transmission • Structured Triage
                </CardDescription>
              </div>
            </div>

            {/* Voice Reply Toggle */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Button
                variant={spokenRepliesEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSpokenRepliesEnabled(!spokenRepliesEnabled)}
                className="h-8 px-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5"
                title={spokenRepliesEnabled ? "Voice replies enabled" : "Voice replies off"}
              >
                {spokenRepliesEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Spoken Replies: {spokenRepliesEnabled ? "ON" : "OFF"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat / Consultation Stream */}
        <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-none shadow-md"
                    : "bg-muted/60 border border-border text-foreground rounded-bl-none shadow-sm"
                }`}
              >
                {/* User uploaded image preview if present */}
                {msg.imagePreview && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-w-[200px]">
                    <img src={msg.imagePreview} alt="Consultation Scan" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Plain text message */}
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                {/* Structured Clinical Advice Box */}
                {msg.structuredAdvice && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Clinical Triage Assessment
                      </span>
                      <Badge
                        className={`text-[9px] font-mono uppercase font-bold ${
                          msg.structuredAdvice.urgencyLevel === "EMERGENCY"
                            ? "bg-red-500/20 text-red-500 border border-red-500/40"
                            : msg.structuredAdvice.urgencyLevel === "URGENT_EVALUATION"
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                            : "bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/40"
                        }`}
                      >
                        Urgency: {msg.structuredAdvice.urgencyLevel.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Possible Causes to Discuss */}
                    {msg.structuredAdvice.possibleCausesToDiscuss?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
                          Possible Causes to Discuss with Doctor:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
                          {msg.structuredAdvice.possibleCausesToDiscuss.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* What to Watch For */}
                    {msg.structuredAdvice.whatToWatchFor?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold block flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Warning Signs to Watch For:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {msg.structuredAdvice.whatToWatchFor.map((sign, i) => (
                            <li key={i}>{sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Questions for Doctor */}
                    {msg.structuredAdvice.followUpQuestionsForDoctor?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
                          Questions to Ask Your Doctor:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
                          {msg.structuredAdvice.followUpQuestionsForDoctor.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    {msg.structuredAdvice.clinicalNotes && (
                      <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                        {msg.structuredAdvice.clinicalNotes}
                      </p>
                    )}

                    {/* Speaker trigger button */}
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(msg.structuredAdvice?.clinicalNotes || "")}
                        className="h-6 px-2 text-[10px] font-mono text-teal-600 dark:text-teal-400 hover:bg-teal-500/10"
                      >
                        <Volume2 className="w-3 h-3 mr-1" /> Listen Aloud
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        No prescription • Educational triage
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-500" />
              <span>Analyzing symptoms under clinical red-flag & structured guidelines...</span>
            </div>
          )}
        </CardContent>

        {/* Selected Image Thumbnail preview */}
        {selectedImage && (
          <div className="px-6 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <img src={selectedImage.previewUrl} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover border border-border" />
              <div>
                <span className="font-bold block text-foreground">Clinical Image Attached</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedImage.width}x{selectedImage.height} • {(selectedImage.sizeBytes / 1024).toFixed(0)} KB (EXIF stripped)
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-muted/30 border-t border-border space-y-3">
          
          {/* Privacy Consent Checkbox */}
          <div className="flex items-start space-x-2.5 text-[11px] text-muted-foreground font-mono p-2 rounded-xl bg-card border border-border/60">
            <Checkbox
              id="ai-consent"
              checked={aiConsentGiven}
              onCheckedChange={(checked) => saveConsent(Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="ai-consent" className="cursor-pointer leading-tight text-[11px] select-none">
              I consent to automated clinical triage analysis. Direct identifiers (name, contact, full DOB) are stripped.
            </Label>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500 transition-all space-y-2">
            {/* The Text Input */}
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your symptoms, medications, or medical questions here (e.g., 'I have fever and persistent dry cough for 2 days')..."
              className="w-full resize-none border-0 bg-transparent p-1 text-xs sm:text-sm focus-visible:ring-0 shadow-none min-h-[54px] max-h-36 text-foreground placeholder:text-muted-foreground"
              rows={2}
            />

            {/* Bottom Actions Row: Modalities + Send */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Camera / Image Upload */}
                <label
                  htmlFor="clinical-image-upload"
                  className="h-8 px-2.5 rounded-xl bg-muted/80 border border-border hover:border-teal-500/40 hover:bg-muted flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors shadow-xs text-xs font-medium shrink-0"
                  title="Upload clinical image (skin rash, lesion, eye, prescription)"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="text-[11px] font-semibold">Image</span>
                  <input
                    id="clinical-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {/* Microphone Voice Dictation */}
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={`h-8 px-2.5 rounded-xl text-xs font-medium gap-1.5 shrink-0 ${
                    isListening ? "bg-red-600 hover:bg-red-700 animate-pulse text-white" : "bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak your symptoms"}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-semibold">{isListening ? "Listening..." : "Voice"}</span>
                </Button>
              </div>

              {/* Send Button */}
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={loading || (!inputMessage.trim() && !selectedImage)}
                className="h-8 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Embedded SOS Panic Modal */}
      <SOSPanicModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </div>
  );
}

export default AIDoctorHUD;

