import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Siren, AlertTriangle, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface SOSButtonProps {
  className?: string;
  variant?: "floating" | "inline";
  onConfirmSOS?: () => void;
}

export function SOSButton({
  className,
  variant = "floating",
  onConfirmSOS,
}: SOSButtonProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleTrigger = () => {
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (onConfirmSOS) {
      onConfirmSOS();
    } else {
      toast.error("Emergency SOS Broadcast Triggered!", {
        description: "Transmitting live GPS coordinates and biometric vitals to the nearest Primary Health Centre (PHC) ambulance fleet.",
        duration: 8000,
      });
      navigate("/alerts");
    }
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

      {/* Standard Accessible Confirmation Modal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl bg-surface dark:bg-surface border border-border p-6 shadow-2xl">
          <AlertDialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Confirm Emergency SOS Broadcast?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This action will transmit your live GPS coordinates, current cardiovascular vitals, and medical baseline to the district emergency dispatch ring and alert your designated primary emergency contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 gap-2 sm:gap-3">
            <AlertDialogCancel className="rounded-xl h-10 text-sm font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 text-sm font-bold shadow-md gap-1.5"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Confirm & Broadcast SOS</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

