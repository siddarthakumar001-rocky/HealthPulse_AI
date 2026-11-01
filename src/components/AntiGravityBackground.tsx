import { motion, useScroll, useTransform } from "framer-motion";

export function AntiGravityBackground() {
  const { scrollYProgress } = useScroll();

  // Scroll parallax transforms for depth separation
  const yOrb1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yOrb2 = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const yOrb3 = useTransform(scrollYProgress, [0, 1], [0, 110]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── MERMAID GLASS HYDRO BACKGROUND PARTICLES & CAUSTICS ── */}

      {/* Orb 1: Radiant Seafoam & Mermaid Aqua */}
      <motion.div
        className="absolute -top-24 -left-20 w-[480px] h-[480px] rounded-full opacity-60 dark:opacity-35 filter blur-[95px]"
        style={{
          y: yOrb1,
          background: "radial-gradient(circle, #05D3B3 0%, #06D6A0 40%, #2DD4BF 70%, transparent 100%)",
        }}
        animate={{
          x: [0, 50, -30, 0],
          scale: [1, 1.08, 0.94, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 2: Deep Ocean Cyan & Emerald Hydro Marine */}
      <motion.div
        className="absolute top-1/4 -right-24 w-[540px] h-[540px] rounded-full opacity-50 dark:opacity-30 filter blur-[110px]"
        style={{
          y: yOrb2,
          background: "radial-gradient(circle, #0D9488 0%, #0891B2 45%, #0EA5E9 75%, transparent 100%)",
        }}
        animate={{
          x: [0, -60, 40, 0],
          scale: [1, 0.92, 1.06, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 3: Luminous Mint Droplet Caustic Shimmer */}
      <motion.div
        className="absolute -bottom-28 left-1/3 w-[500px] h-[500px] rounded-full opacity-45 dark:opacity-25 filter blur-[100px]"
        style={{
          y: yOrb3,
          background: "radial-gradient(circle, #34D399 0%, #10B981 50%, #A7F3D0 80%, transparent 100%)",
        }}
        animate={{
          x: [0, 45, -45, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
