import { motion, useReducedMotion } from "framer-motion";

export function AntiGravityBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Light/Dark Adaptive Soft Ambient Orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full opacity-35 dark:opacity-25 filter blur-[80px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #38BDF8 0%, #0284C7 70%, transparent 100%)",
        }}
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0, scale: 1 }
            : {
                x: [0, 40, -20, 0],
                y: [0, 40, 10, 0],
                scale: [1, 1.05, 0.95, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="absolute top-1/3 -right-20 w-[460px] h-[460px] rounded-full opacity-30 dark:opacity-20 filter blur-[90px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #818CF8 0%, #4F46E5 70%, transparent 100%)",
        }}
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0, scale: 1 }
            : {
                x: [0, -40, 20, 0],
                y: [0, -30, 20, 0],
                scale: [1, 0.95, 1.05, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 22, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="absolute -bottom-20 left-1/4 w-[420px] h-[420px] rounded-full opacity-30 dark:opacity-20 filter blur-[85px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #34D399 0%, #059669 70%, transparent 100%)",
        }}
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0, scale: 1 }
            : {
                x: [0, 30, -30, 0],
                y: [0, -20, 30, 0],
                scale: [1, 1.04, 0.96, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </div>
  );
}
