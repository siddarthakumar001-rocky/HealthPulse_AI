import { motion } from "framer-motion";

interface HumanBodyViewProps {
  heartRate: number;
  fingerPresent: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  painAreas?: string[];
}

export default function HumanBodyView({ heartRate, fingerPresent, status, painAreas = [] }: HumanBodyViewProps) {
  const isPulsing = status === 'connected' && heartRate > 0;
  // Calculate pulse duration based on heart rate (e.g., 60 bpm = 1s)
  const pulseDuration = heartRate > 0 ? 60 / heartRate : 1;

  return (
    <div className="relative w-full h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl liquid-glass holographic-edge">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Scanning Line overlay (continuous) */}
      <div className="scan-line" />

      {/* SVG Human Body Outline */}
      <div className="relative z-10 w-full h-full p-8 flex justify-center items-center">
        <svg 
          viewBox="0 0 100 250" 
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full max-w-[200px] md:max-w-none drop-shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all duration-500"
        >
          <g stroke="rgba(0, 243, 255, 0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="50" cy="20" r="15" />
            {/* Torso/Shoulders */}
            <path d="M 35 35 Q 50 45 65 35 L 85 60 L 80 120 L 70 120 L 70 65 L 65 65 L 65 140 L 55 140 L 55 230 L 45 230 L 45 140 L 35 140 L 35 65 L 30 65 L 30 120 L 20 120 L 15 60 Z" />
            {/* Inner technological lines */}
            <path d="M 50 35 L 50 140" stroke="rgba(0, 243, 255, 0.3)" strokeDasharray="2 2" />
            <path d="M 35 65 Q 50 80 65 65" stroke="rgba(0, 243, 255, 0.3)" />
            <path d="M 35 85 Q 50 100 65 85" stroke="rgba(0, 243, 255, 0.3)" />
            <path d="M 35 105 Q 50 120 65 105" stroke="rgba(0, 243, 255, 0.3)" />
          </g>

          {/* Glowing Heart */}
          <g transform="translate(52, 60)">
            <motion.path 
              d="M 0 -2 C -2 -6 -8 -6 -8 -2 C -8 2 0 8 0 8 C 0 8 8 2 8 -2 C 8 -6 2 -6 0 -2 Z"
              fill="rgba(255, 0, 102, 0.8)"
              stroke="rgba(255, 0, 102, 1)"
              strokeWidth="1"
              className="pulse-cyan"
              animate={isPulsing ? {
                scale: [1, 1.3, 1],
                filter: ["drop-shadow(0 0 5px rgba(255, 0, 102, 0.5))", "drop-shadow(0 0 15px rgba(255, 0, 102, 1))", "drop-shadow(0 0 5px rgba(255, 0, 102, 0.5))"]
              } : { scale: 1 }}
              transition={isPulsing ? {
                duration: pulseDuration,
                repeat: Infinity,
                ease: "easeInOut"
              } : {}}
            />
          </g>

          {/* Finger Sensor Indicator (Right Hand) */}
          <g transform="translate(18, 120)">
            <circle cx="0" cy="0" r="4" fill={fingerPresent ? "rgba(0, 255, 102, 0.8)" : "transparent"} stroke={fingerPresent ? "rgba(0, 255, 102, 1)" : "rgba(0, 243, 255, 0.3)"} strokeWidth="1" />
            {fingerPresent && (
              <motion.circle 
                cx="0" cy="0" r="4" fill="none" stroke="rgba(0, 255, 102, 0.8)" strokeWidth="1"
                animate={{ scale: [1, 2.5], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </g>
          {/* Pain Area Indicators */}
          {painAreas.map((area, idx) => {
            const normalizedArea = area.toLowerCase();
            let coords = { cx: 50, cy: 125 }; // Default to center

            if (normalizedArea.includes('head')) coords = { cx: 50, cy: 20 };
            else if (normalizedArea.includes('chest') || normalizedArea.includes('heart')) coords = { cx: 50, cy: 65 };
            else if (normalizedArea.includes('abdomen') || normalizedArea.includes('stomach')) coords = { cx: 50, cy: 110 };
            else if (normalizedArea.includes('back')) coords = { cx: 50, cy: 90 };
            else if (normalizedArea.includes('left arm')) coords = { cx: 20, cy: 100 };
            else if (normalizedArea.includes('right arm')) coords = { cx: 80, cy: 100 };
            else if (normalizedArea.includes('left leg')) coords = { cx: 40, cy: 180 };
            else if (normalizedArea.includes('right leg')) coords = { cx: 60, cy: 180 };
            else if (normalizedArea.includes('joints')) coords = { cx: 50, cy: 140 };

            return (
              <g key={idx} transform={`translate(${coords.cx}, ${coords.cy})`}>
                <circle cx="0" cy="0" r="3" fill="rgba(255, 100, 0, 0.6)" stroke="rgba(255, 100, 0, 1)" strokeWidth="0.5" />
                <motion.circle 
                  cx="0" cy="0" r="3" fill="none" stroke="rgba(255, 100, 0, 0.8)" strokeWidth="0.5"
                  animate={{ scale: [1, 3], opacity: [1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Overlay Status Text */}
      <div className="absolute top-4 left-4 font-mono text-xs text-cyan-800 dark:text-cyan-400 uppercase font-bold">
        <p className="dark:neon-text-cyan">SYS_STATUS: {status}</p>
        <p>SENSOR: {fingerPresent ? 'LOCKED' : 'WAITING'}</p>
      </div>
      
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-cyan-800/80 dark:text-cyan-500/50 text-right font-bold">
        <p>BIO-METRIC SCAN v2.4.1</p>
        <p>AI_ANALYTICS_ENGINE: ONLINE</p>
      </div>
    </div>
  );
}
