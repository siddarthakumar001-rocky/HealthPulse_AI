import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Cpu, RefreshCw, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WaveformPoint {
  time: string;
  sensorHR?: number | null;
  csdiHR?: number | null;
  forecastHR?: number | null;
  status: "sensor" | "csdi" | "forecast";
}

interface TriToneWaveformProps {
  currentHR?: number;
}

export default function TriToneWaveform({ currentHR = 74 }: TriToneWaveformProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [imputedCount, setImputedCount] = useState(3);

  // Generate realistic initial 20-point physiological sequence
  const initialData: WaveformPoint[] = [
    { time: "00s", sensorHR: 72, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "03s", sensorHR: 73, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "06s", sensorHR: 75, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "09s", sensorHR: 74, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "12s", sensorHR: 76, csdiHR: null, forecastHR: null, status: "sensor" },
    // Sensor dropout simulated at 15s - 21s -> Reconstructed by CSDI
    { time: "15s", sensorHR: null, csdiHR: 77, forecastHR: null, status: "csdi" },
    { time: "18s", sensorHR: null, csdiHR: 78, forecastHR: null, status: "csdi" },
    { time: "21s", sensorHR: null, csdiHR: 76, forecastHR: null, status: "csdi" },
    // Sensor restored
    { time: "24s", sensorHR: 75, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "27s", sensorHR: 73, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "30s", sensorHR: 74, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "33s", sensorHR: 76, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "36s", sensorHR: 75, csdiHR: null, forecastHR: null, status: "sensor" },
    { time: "39s", sensorHR: 77, csdiHR: null, forecastHR: null, status: "sensor" },
    // Future Forecast Window (TimeGrad extension)
    { time: "+3s", sensorHR: null, csdiHR: null, forecastHR: 78, status: "forecast" },
    { time: "+6s", sensorHR: null, csdiHR: null, forecastHR: 79, status: "forecast" },
    { time: "+9s", sensorHR: null, csdiHR: null, forecastHR: 80, status: "forecast" },
    { time: "+12s", sensorHR: null, csdiHR: null, forecastHR: 78, status: "forecast" },
  ];

  const [seriesData, setSeriesData] = useState<WaveformPoint[]>(initialData);

  const handleSimulateDropAndImpute = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Simulate introducing another dropout window and healing it with CSDI
      const updated = seriesData.map((pt, idx) => {
        if (idx >= 8 && idx <= 10) {
          const estimated = Math.round(73 + Math.sin(idx) * 3);
          return { ...pt, sensorHR: null, csdiHR: estimated, status: "csdi" as const };
        }
        return pt;
      });
      setSeriesData(updated);
      setImputedCount((prev) => prev + 3);
      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="rounded-3xl p-5 mermaid-glass border border-teal-400/35 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              CSDI Diffusion Time-Series Reconstruction
            </h3>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px] tracking-wider uppercase bg-cyan-950/30">
              HDT Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conditional score-based diffusion model recovering missing physiological samples
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" />
            <span className="text-foreground">Sensor Raw</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
            <span className="text-cyan-400 font-semibold">CSDI Imputed</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-0.5 border-t-2 border-dotted border-amber-400 inline-block" />
            <span className="text-amber-400">TimeGrad Forecast</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={seriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis domain={[65, 85]} stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0].payload as WaveformPoint;
                return (
                  <div className="bg-popover/95 border border-border p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
                    <p className="font-bold text-foreground mb-1">Timeline: {pt.time}</p>
                    {pt.sensorHR !== null && pt.sensorHR !== undefined && (
                      <p className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Sensor: <strong>{pt.sensorHR} BPM</strong>
                      </p>
                    )}
                    {pt.csdiHR !== null && pt.csdiHR !== undefined && (
                      <p className="text-cyan-400 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> CSDI Reconstructed: <strong>{pt.csdiHR} BPM</strong> (Imputed)
                      </p>
                    )}
                    {pt.forecastHR !== null && pt.forecastHR !== undefined && (
                      <p className="text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Forecast: <strong>{pt.forecastHR} BPM</strong> (Gated)
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {/* Real Sensor: Solid Line */}
            <Line
              type="monotone"
              dataKey="sensorHR"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981" }}
              connectNulls={false}
              name="● Measured"
            />
            {/* CSDI Reconstructed: Dashed Line */}
            <Line
              type="monotone"
              dataKey="csdiHR"
              stroke="#06b6d4"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#06b6d4", strokeWidth: 1.5 }}
              connectNulls={true}
              name="-- Reconstructed"
            />
            {/* Forecast: Dotted Line */}
            <Line
              type="monotone"
              dataKey="forecastHR"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="2 3"
              dot={{ r: 3, fill: "#f59e0b" }}
              connectNulls={true}
              name="·· Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer controls, legend & IEEE disclaimer */}
      <div className="mt-3 pt-3 border-t border-border/60 flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              ● Measured (Solid)
            </Badge>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              -- Reconstructed (Dashed)
            </Badge>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              ·· Forecast (Dotted)
            </Badge>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-1.5"
            onClick={handleSimulateDropAndImpute}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 text-cyan-400" />
            )}
            Simulate Observation Masking & Diffusion
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground italic bg-muted/20 p-1.5 rounded">
          *Reconstructed and forecast telemetry are not direct sensor measurements and are subject to provenance gating.
        </p>
      </div>
    </div>
  );
}
