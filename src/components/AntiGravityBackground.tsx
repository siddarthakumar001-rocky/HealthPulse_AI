import { motion, useScroll, useTransform } from "framer-motion";

export function AntiGravityBackground() {
  const { scrollYProgress } = useScroll();

  // Scroll parallax transforms for depth separation
  const yOrb1 = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yOrb2 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const yOrb3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Soft Blue Orb */}
      <motion.div
        className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full opacity-50 dark:opacity-30 filter blur-[90px]"
        style={{
          y: yOrb1,
          background: "radial-gradient(circle, #93C5FD 0%, #BFDBFE 70%, transparent 100%)",
        }}
        animate={{
          x: [0, 45, -25, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pale Lavender Orb */}
      <motion.div
        className="absolute top-1/3 -right-20 w-[480px] h-[480px] rounded-full opacity-45 dark:opacity-25 filter blur-[100px]"
        style={{
          y: yOrb2,
          background: "radial-gradient(circle, #DDD6FE 0%, #E9D5FF 70%, transparent 100%)",
        }}
        animate={{
          x: [0, -50, 30, 0],
          scale: [1, 0.94, 1.04, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cloud Cyan Orb */}
      <motion.div
        className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] rounded-full opacity-40 dark:opacity-20 filter blur-[95px]"
        style={{
          y: yOrb3,
          background: "radial-gradient(circle, #A5F3FC 0%, #CFFAFE 70%, transparent 100%)",
        }}
        animate={{
          x: [0, 40, -40, 0],
          scale: [1, 1.04, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
