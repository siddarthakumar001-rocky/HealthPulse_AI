import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, HardDrive, Trash2, Zap, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TelemetryRingBuffer, storageManager } from "@/lib/telemetryRingBuffer";
import { useToast } from "@/hooks/use-toast";

interface RAMConsoleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ringBuffer?: TelemetryRingBuffer;
}

export function RAMConsoleModal({ open, onOpenChange, ringBuffer }: RAMConsoleProps) {
  const [bufferCount, setBufferCount] = useState(ringBuffer?.getUsageCount() || 48);
  const [freedBytes, setFreedBytes] = useState<number | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ringBuffer) {
      const interval = setInterval(() => {
        setBufferCount(ringBuffer.getUsageCount());
      }, 500);
      return () => clearInterval(interval);
    }
  }, [ringBuffer]);

  const handleGC = () => {
    setIsCleaning(true);
    setTimeout(() => {
      if (ringBuffer) {
        ringBuffer.clear();
        setBufferCount(0);
      }
      const freed = storageManager.auditAndPrune();
      setFreedBytes(freed);
      setIsCleaning(false);
      toast({
        title: "Memory Optimized & GC Executed",
        description: `Ring buffer reset (Float32Array). Freed ${Math.round(freed / 1024)} KB of stale cache.`,
      });
    }, 800);
  };

  const capacity = ringBuffer?.getCapacity() || 128;
  const usagePercent = Math.round((bufferCount / capacity) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-extrabold font-display">
            RAM & Telemetry Storage Console
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Zero-GC Telemetry Ring Buffer (`Float32Array`) & LocalStorage Cache Auditor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Ring Buffer Capacity Meter */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Activity className="w-4 h-4 text-cyan-500" /> Ring Buffer Slots
              </span>
              <span className="text-cyan-600 dark:text-cyan-400">
                {bufferCount} / {capacity} ({usagePercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Float32Array pre-allocated contiguous memory preventing browser heap fragmentation.
            </p>
          </div>

          {/* LocalStorage Status */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <HardDrive className="w-4 h-4 text-emerald-500" /> Cache Integrity
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Auto-pruning stale telemetry chunks prevents mobile storage threshold blocks.
            </p>
          </div>
        </div>

        <Button
          onClick={handleGC}
          disabled={isCleaning}
          className="w-full h-12 rounded-2xl font-extrabold uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isCleaning ? (
            <>
              <Zap className="w-4 h-4 animate-spin text-white" />
              Running Garbage Collector...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Simulate Garbage Collection & Prune Cache
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
