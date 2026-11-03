import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import SOSPanicModal from "./SOSPanicModal";

export interface SOSButtonProps {
  className?: string;
  variant?: "floating" | "inline";
  onConfirmSOS?: () => void;
  currentVitals?: {
    heartRate?: number;
    spO2?: number;
    temperature?: number;
  };
}

export function SOSButton({
  className,
  variant = "floating",
  onConfirmSOS,
  currentVitals,
}: SOSButtonProps) {
  const [open, setOpen] = useState(false);

  const handleTrigger = () => {
    setOpen(true);
    if (onConfirmSOS) onConfirmSOS();
  };

  return (
    <>
      {variant === "floating" ? (
        <div
          className={cn(
            "fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden",
            className
          )}
        >
          <Button
            type="button"
            onClick={handleTrigger}
            aria-label="Trigger Emergency SOS"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl border-2 border-white dark:border-slate-900 transition-transform active:scale-95 flex items-center justify-center group"
          >
            <Siren className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="sr-only">Emergency SOS</span>
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleTrigger}
          variant="destructive"
          className={cn("font-bold text-xs sm:text-sm gap-2 h-10 px-4 rounded-xl", className)}
        >
          <Siren className="w-4 h-4 animate-pulse" />
          <span>Emergency SOS</span>
        </Button>
      )}

      {/* Complete Emergency SOS Modal */}
      <SOSPanicModal
        isOpen={open}
        onClose={() => setOpen(false)}
        currentVitals={currentVitals}
      />
    </>
  );
}

export default SOSButton;
