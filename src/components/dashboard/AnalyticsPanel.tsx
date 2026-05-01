import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AnalyticsPanelProps {
  chartData: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-4 rounded-xl border-cyan-500/30">
        <p className="font-mono text-xs text-foreground/60 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 font-mono text-sm">
            <span style={{ color: entry.color }}>{entry.name.toUpperCase()}:</span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ chartData }: AnalyticsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
      <motion.div className="liquid-glass rounded-2xl p-6 h-full flex flex-col holographic-edge" whileHover={{ scale: 1.03, y: -2 }}>
        <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-cyan" />
          Heart Rate Trend
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 243, 255, 0.1)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(0, 243, 255, 0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(0, 243, 255, 0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 243, 255, 0.2)', strokeWidth: 2 }} />
              <Line 
                type="monotone" 
                dataKey="hr" 
                name="HR (BPM)"
                stroke="#00f3ff" 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 6, fill: "#00f3ff", stroke: "currentColor", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 0 8px rgba(0,243,255,0.8))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div className="liquid-glass rounded-2xl p-6 h-full flex flex-col holographic-edge" whileHover={{ scale: 1.03, y: -2 }}>
        <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-cyan" />
          AI Stress & Temp Metrics
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 243, 255, 0.1)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(0, 243, 255, 0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(0, 243, 255, 0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 243, 255, 0.2)', strokeWidth: 2 }} />
              <Line 
                type="monotone" 
                dataKey="temp" 
                name="Temp (°C)"
                stroke="#ff9900" 
                strokeWidth={2} 
                dot={false} 
                style={{ filter: "drop-shadow(0 0 5px rgba(255,153,0,0.6))" }}
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                name="Stress"
                stroke="#ff00ff" 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 6, fill: "#ff00ff", stroke: "currentColor", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 0 8px rgba(255,0,255,0.8))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
